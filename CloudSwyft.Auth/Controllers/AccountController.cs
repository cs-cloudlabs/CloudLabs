using CloudSwyft.Auth.Models;
using CloudSwyft.OAuthServer.Helpers;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace CloudSwyft.Auth.Controllers
{
    [RoutePrefix("api/Account")]
    public class AccountController : ApiController
    {
        AuthContext _db = new AuthContext();
        AuthRepository auth = new AuthRepository();
        private UserManager<ApplicationUser> _userManager;
        private AuthContext _ctx;
        private AuthRepository _repo = null;
        public string cloudLabsServer = System.Configuration.ConfigurationManager.AppSettings["CloudLabsUrl"];
        public string authContext = System.Configuration.ConfigurationManager.ConnectionStrings["AuthContext"].ConnectionString;

        public AccountController()
        {
            _repo = new AuthRepository();
            _ctx = new AuthContext();

            _userManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(_ctx));
        }

        // POST api/Account/Register
        [AllowAnonymous]
        [Route("Register")]
        public async Task<IHttpActionResult> Register(RegisterViewModel userModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result = await _repo.RegisterUser(userModel);

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _repo.Dispose();
            }

            base.Dispose(disposing);
        }

        private IHttpActionResult GetErrorResult(IdentityResult result)
        {
            if (result == null)
            {
                return InternalServerError();
            }

            if (!result.Succeeded)
            {
                if (result.Errors != null)
                {
                    foreach (string error in result.Errors)
                    {
                        ModelState.AddModelError("", error);
                    }
                }

                if (ModelState.IsValid)
                {
                    // No ModelState errors are available to send, so just return an empty BadRequest.
                    return BadRequest();
                }

                return BadRequest(ModelState);
            }

            return null;
        }

        [Authorize]
        [HttpGet]
        [Route("Me")]
        public async Task<HttpResponseMessage> Me()
        {
            try
            {
                string userId = User.Identity.GetUserId().ToString();
                ApplicationUser user = await auth.FindUserById(userId);
                string rid = user.Roles.Select(r => r.RoleId).FirstOrDefault();
                var roleName = _db.Roles.Where(r => r.Id == rid).FirstOrDefault().Name;
                var pass = user.PasswordHash;
                MeViewModel userViewModel = new MeViewModel
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    EmailConfirmed = user.EmailConfirmed,
                    Role = roleName,
                    IsDeleted = user.isDeleted,
                    IsDisabled = user.isDisabled,
                    Thumbnail = user.Thumbnail,
                    Password = user.PasswordHash,
                    UserId = user.UserId

                };
                return Request.CreateResponse(HttpStatusCode.OK, userViewModel);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, e.Message);
            }
        }
        
        [HttpPost]
        [Route("Create")]
        public async Task<IHttpActionResult> CreateUser(UserViewModel model)
        {
            try
            {
                //var dbName = authContext.Split(new string[] { "Initial Catalog=" }, StringSplitOptions.None)[1].Split(';')[0];

                if (ModelState.IsValid)
                {
                    string userId = User.Identity.GetUserId().ToString();
                    ApplicationUser adminUser = await auth.FindUserById(userId);
                    IdentityResult result;
                    var user = new ApplicationUser
                    {
                        FirstName = model.FirstName,
                        LastName = model.LastName,
                        UserName = model.Email,
                        Email = model.Email,
                        CreatedBy = adminUser.FirstName + " " + adminUser.LastName,
                        DateCreated = DateTime.Today,
                        TenantId = adminUser.TenantId
                    };
                    result = await _userManager.CreateAsync(user, model.Password);

                    if (result.Succeeded)
                    {

                        user.EmailConfirmed = false;
                        if (model.Roles != null)
                        {
                            await _userManager.AddToRolesAsync(user.Id, model.Roles);
                        }
                        using (HttpClient client = new HttpClient())
                        {
                            SendClientUpdateMail(user.Id, user.Email, model.Password, false);
                            //await client.GetAsync(cloudLabsServer + "api/users/SendClientUpdateMail?userId=" + user.Id + "&email=" + user.Email + "&password=" + model.Password + "&isEdit=" + false);
                        }

                        user.CredentialsSent = true;
                        await _userManager.UpdateAsync(user);
                        return Ok(user);
                    }
                    else
                        AddErrors(result);
                }
                return BadRequest(ModelState);
            }
            catch (Exception e)
            {
                return BadRequest(ModelState);

            }

        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        
        public void SendClientUpdateMail(string userId, string email, string password, bool isEdit)
        {
            string emailNew = cloudLabsServer + "Account/ConfirmEmail/";
            //string emailNew = "http://localhost:51101//Account/ConfirmEmail/";

            MailInfo mailInfo = new MailInfo();
            mailInfo.SendTo = email;
            string htmlBody = string.Empty;
            if (isEdit)
            {

                htmlBody = "<head>"
                       + "<meta charset='utf-8'>"
                       + "<meta name='viewport' content='width=device-width, initial-scale=1.0'/>"
                       + "<title> Welcome to CloudSwyft!</title>"
                       + "<link rel='stylesheet' href=''>"
                       + "</head>"
                       + "<body style='margin: 0; padding: 0; font-family:'Open Sans', sans;'>"
                       + "<table border='0' cellpadding='0' cellspacing='0' width='100%'>"
                       + "<tr><td><table align = 'center' border = '0' cellpadding = '0' cellspacing = '0' width = '600' style = 'border-collapse: collapse; border:1px solid #1058a0;'><tr><td>"
                       + "<table align='center' width='600' style='background-color: #00c1f8; padding-top:2%; border-top:4px solid #1058a0;'>"
                       + "<tr align='center'>"
                       + "<td style='padding-top:10px; font-size: 18px; font-family: Helvetica'>Welcome</td></tr>"
                       + "<tr align='center'><td style='font-family: Trebuchet MS;color: white;font-weight: bold; font-size: 60px;'>CloudSwyft</td></tr>"
                       + "<tr align='center'><td style='font-family: Verdana; font-size: 23px;color: #005bab;'>ASSESSMENT PLATFORM</td></tr>"
                       + "</table>"

                       + "<table align = 'center' style='background-color: white;padding-top:3%;'>"
                       + "<td align = 'center'><table align = 'center' border = '0' style = 'padding:0 95px 0 95px;' ><tr align = 'center' >"
                       + "<td align='center' style='font-family: Verdana; font-size: 15px;'> Your Account Email address has been updated.</td></tr ></table>"
                       + "<tr>"

                       + "<table align = 'center' style='padding:2%; background-color:#287eb7; width:50%; color: white; border-radius: 6px;'>"
                       + "<tr align='center'><td style='border: 1px solid #00c1f8; padding: 5px;'> Email: <a style='text-decoration: none; color: #fff;'>" + email + "</a></td ></tr > "
                       + "</table>"

                       + "<table align = 'center' style='background-color: white;padding-top:3%;'>"
                       + "<tr align='center'><td style='margin-top:2%; font-family: Verdana; font-size: 15px;'>Behold the future of Technology Skills Evaluation,</td ></tr > "
                       + "<tr align='center' style='padding-bottom:3%; margin-bottom:3%; font-family: Verdana; font-size: 15px;'><td>We are excited to get you on-board!</td ></tr > "
                       + "</table>"

                       + "<table align = 'center' style='width:30%;height:40px;border-radius:5px;background-color:#8FD034;border-bottom:3px solid #1D4B09; margin-top: 3%;'>"
                       + "<tr align='center'><td style='color:white'><a href = " + emailNew + "?userId=" + userId + " style ='text-decoration: none; color: #fff;'> LOGIN </a></td ></tr > "
                       + "</table>";

            }
            else
            {
                htmlBody = "<head>"
                       + "<meta charset='utf-8'>"
                       + "<meta name='viewport' content='width=device-width, initial-scale=1.0'/>"
                       + "<title> Welcome to CloudSwyft!</title>"
                       + "<link rel='stylesheet' href=''>"
                       + "</head>"
                       + "<body style='margin: 0; padding: 0; font-family:'Open Sans', sans;'>"

                       + "<table border='0' cellpadding='0' cellspacing='0' width='100%'>"
                       + "<tr><td><table align = 'center' border = '0' cellpadding = '0' cellspacing = '0' width = '600' style = 'border-collapse: collapse; border:1px solid #1058a0;'><tr><td>"

                       + "<table align='center' width='600' style='background-color: #00bff6;padding-top:2%;border-top:2px solid blue;'>"
                       + "<tr align='center'>"
                       + "<td style='padding-top:10px; font-size: 18px; font-family: Helvetica'>Welcome</td></tr>"
                       + "<tr align='center'><td style='font-family: Trebuchet MS;color: white;font-weight: bold; font-size: 60px;'>CloudSwyft</td ></tr >"
                       + "<tr align='center'><td style='font-family: Verdana; font-size: 23px;color: #005bab;'>TRAINING PLATFORM</td></tr >"
                       + "</table>"

                       + "<table align = 'center' style='background-color: white;padding-top:3%;'>"
                       + "<td align = 'center'><table align = 'center' border = '0' style = 'padding:0 95px 0 95px;' ><tr align = 'center' >"
                       + "<td align='center' style='font-family: Verdana; font-size: 15px;'> A User Account has been created for you.</td></tr ></table>"
                       + "<tr>"

                       + "<table align = 'center' style='padding:2% 2% 2% 2%;background-color:#237BB7; width:50%; color: white; '>"
                       + "<tr align='center'><td style='border: 1px solid #00c1f8; padding: 5px;'> Email: <a style='text-decoration: none; color: #fff;'>" + email + "</a></td ></tr>"
                       + "</table>"

                       + "<table align = 'center' style='background-color: white;padding-top:3%;'>"
                       + "<tr align='center'><td style='margin-top:2%; font-family: Verdana; font-size: 15px;'>Behold the future of Technology Skills Evaluation,</td ></tr > "
                       + "<tr align='center' style='padding-bottom:3%; margin-bottom:3%; font-family: Verdana; font-size: 15px;'><td>We are excited to get you on-board!</td ></tr > "
                       + "</table>"

                       + "<table align = 'center' style='width:30%;height:40px;border-radius:5px;background-color:#8FD034;border-bottom:3px solid #1D4B09; margin-top: 3%;'>"
                       + "<tr align='center'><td style='color:white'><a href = " + emailNew + "?userId=" + userId + " style ='text-decoration: none; color: #fff;'> GET STARTED </a></td ></tr > "
                       + "</table>";
            }

            mailInfo.Subject = "Welcome to CloudSwyft";

            mailInfo.HtmlBody = htmlBody;

            MailHelper.SendMail(mailInfo);
        }

        [HttpPost]
        [Route("EditProfile")]
        public async Task<IHttpActionResult> EditProfile(EditViewModel editModel)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    ApplicationUser user = await _userManager.FindByIdAsync(editModel.Id);

                    IdentityResult result;

                    user.FirstName = editModel.FirstName;
                    user.UserName = editModel.Email;
                    user.LastName = editModel.LastName;
                    user.Email = editModel.Email;
                    result = await _userManager.UpdateAsync(user);

                    if (result.Succeeded)
                    {
                        string[] allUserRoles = _userManager.GetRoles(editModel.Id).ToArray();
                        _userManager.RemoveFromRoles(editModel.Id, allUserRoles);

                        await _userManager.AddToRolesAsync(user.Id, editModel.Roles);

                        return Ok(user);
                    }
                    else
                        AddErrors(result);
                }
                catch (Exception e)
                {

                }

            }
            return BadRequest(ModelState);
        }

        [HttpDelete]
        [Route("Disable")]
        public async Task<IHttpActionResult> DisableUser(string userId, bool isDisable)
        {
            ApplicationUser user = _userManager.FindById(userId);
            try
            {
                if (user != null && isDisable)
                {
                    user.isDisabled = true;
                    await _userManager.UpdateAsync(user);
                    return Ok(user);
                }
                else if (user != null && !isDisable)
                {
                    user.isDisabled = false;
                    await _userManager.UpdateAsync(user);
                    return Ok(user);
                }
                else
                    return NotFound();
            }
            catch (Exception e)
            {
                return NotFound();
            }

        }

        [HttpDelete]
        [Route("Delete")]
        public async Task<IHttpActionResult> DeleteUser(string userId)
        {
            ApplicationUser user = _userManager.FindById(userId);

            if (user != null)
            {
                user.isDeleted = true;
                await _userManager.UpdateAsync(user);
                return Ok(user);
            }
            else
            {
                return NotFound();
            }
        }
        
    }
}