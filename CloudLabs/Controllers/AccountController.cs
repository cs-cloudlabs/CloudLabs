using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using CloudSwyft.CloudLabs.Models;
using System.Collections.Generic;
using System.Net.Http;
using System;
using Newtonsoft.Json;
using System.Security.Claims;
using System.Net.Http.Headers;
using Microsoft.Owin.Security;

namespace CloudSwyft.CloudLabs.Controllers
{
    public class AccountController : Controller
    {
        ApplicationDbContext _db = new ApplicationDbContext();
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;
        public string authServer = System.Configuration.ConfigurationManager.AppSettings["CloudSwyftAuthServerUrl"];
        public string cloudLabsServer = System.Configuration.ConfigurationManager.AppSettings["CloudLabsUrl"];
        public AccountController()
        {
        }

        public AccountController(ApplicationUserManager userManager, ApplicationSignInManager signInManager)
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? Request.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set
            {
                _signInManager = value;
            }
        }

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? Request.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        [HttpGet]
        [Route("Register")]
        public ActionResult Register()
        {
            return View();
        }

        [HttpGet]
        [Route("Login")]
        public ActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            if (TempData["CustomError"] != null)
            {
                ModelState.AddModelError(string.Empty, TempData["CustomError"].ToString());
            }
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Login(LoginViewModel model, string returnUrl)
        {
            if (!ModelState.IsValid)
            {
                TempData["CustomError"] = "Invalid username or password";
                return RedirectToAction("Login", "Account");
            }
            Dictionary<string, string> tokenDetails = null;
            using (var client = new HttpClient())
            {
                var login = new Dictionary<string, string>
                    {
                        {"grant_type", "password"},
                        {"username", model.Username },
                        {"password", model.Password }
                    };

                var resp = await client.PostAsync(authServer + "token", new FormUrlEncodedContent(login));

                if (resp.IsSuccessStatusCode)
                {
                    tokenDetails = JsonConvert.DeserializeObject<Dictionary<string, string>>(resp.Content.ReadAsStringAsync().Result);

                    var accessToken = tokenDetails["access_token"].ToString();
                    var currentUser = await GetMe(accessToken);
                    {
                        if (currentUser.Thumbnail == null)
                            currentUser.Thumbnail = "";

                        var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Authentication, accessToken),
                        new Claim(ClaimTypes.GivenName, currentUser.FirstName+" "+ currentUser.LastName),
                        new Claim(ClaimTypes.NameIdentifier, currentUser.Id),
                        new Claim(ClaimTypes.Email, currentUser.Email),
                        new Claim(ClaimTypes.Role, currentUser.Role),
                        new Claim(ClaimTypes.Name, currentUser.FirstName),
                        new Claim(ClaimTypes.Surname, currentUser.LastName),
                        new Claim("Thumbnail", currentUser.Thumbnail),
                        new Claim("IsDeleted", currentUser.isDeleted.ToString()),
                        new Claim("IsDisabled", currentUser.isDisabled.ToString())
                    };
                        var identity = new ClaimsIdentity(claims, DefaultAuthenticationTypes.ApplicationCookie);
                        var properties = new AuthenticationProperties { IsPersistent = model.RememberMe };
                        SignInManager.AuthenticationManager.SignIn(properties, identity);
                        WriteUrlCookie(accessToken);
                    }
                }
                else
                {
                    dynamic responseDetails = JsonConvert.DeserializeObject(resp.Content.ReadAsStringAsync().Result);
                    string error_desc = responseDetails.error_description;

                    TempData["CustomError"] = error_desc;
                    return RedirectToAction("Login", "Account");
                }
            }
            return RedirectToLocal(returnUrl);
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("ConfirmEmail")]
        public ActionResult ConfirmEmail(string userId, string password = "")
        {
            ApplicationUser user = UserManager.FindById(userId);
            if (password != "")
                user.PasswordHash = UserManager.PasswordHasher.HashPassword(password);

            user.EmailConfirmed = true;
            UserManager.Update(user);

            return View();
        }
        
        [HttpGet]
        [Route("Logout")]
        public ActionResult Logout()
        {
            Request.GetOwinContext().Authentication.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
            return RedirectToAction("Login", "Account");
        }

        public async Task<RoleUser> GetMe(string token)
        {
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(authServer);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Add("Authorization", "Bearer " + token);

                var requestPath = authServer + "api/account/me";

                HttpResponseMessage response = await client.GetAsync(requestPath);
                RoleUser userDetails = JsonConvert.DeserializeObject<RoleUser>(response.Content.ReadAsStringAsync().Result);

                return userDetails;
            }
        }

        private void WriteUrlCookie(string accessToken)
        {
            HttpCookie apiCookie = new HttpCookie("CloudSwyftToken");

            apiCookie.Value = accessToken;
            Response.Cookies.Add(apiCookie);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)

            {
                if (_userManager != null)
                {
                    _userManager.Dispose();
                    _userManager = null;
                }

                if (_signInManager != null)
                {
                    _signInManager.Dispose();
                    _signInManager = null;
                }
            }
            base.Dispose(disposing);
        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }

            return RedirectToAction("Index", "Dashboard");
        }

        [AllowAnonymous]
        public ActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            //UserManagementController forSend = new UserManagementController();

            if (ModelState.IsValid)
            {
                try
                {
                    var user = await UserManager.FindByEmailAsync(model.Email);
                    if (user == null || user.EmailConfirmed == false)
                    {
                        ModelState.AddModelError(string.Empty, "Invalid user");
                        return View("ForgotPassword");
                    }

                    user.EmailConfirmed = false;
                    UserManager.Update(user);

                    //await forSend.SendClientUpdateMail(user.Id, model.Email, model.Password, true);

                    return RedirectToAction("ForgotPasswordConfirmation", "Account");
                }
                catch (Exception e)
                {

                }

            }
            return View();
        }

        [AllowAnonymous]
        public ActionResult ForgotPasswordConfirmation()
        {
            return View();
        }

   

    }
}