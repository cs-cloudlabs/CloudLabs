using CloudSwyft.Auth.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace CloudSwyft.Auth.Providers
{
    public class SimpleAuthorizationServerProvider : OAuthAuthorizationServerProvider
    {
        public override async Task   ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            context.Validated();
        }

        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {
            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { "*" });
           ApplicationUser user = new ApplicationUser();
            using (AuthRepository _repo = new AuthRepository())
            {
                user = await _repo.FindUser(context.UserName, context.Password);
                //if (user == null || user.isDisabled == true || user.isDeleted == true)
                if (user == null)
                {
                    context.SetError("invalid_grant", "Invalid Username or Password.");
                    return;
                }
                else if (user.EmailConfirmed == false)
                {
                    context.SetError("invalid_grant", "Email Address is not verified.");
                    return;
                }
            }

            if (user.Thumbnail == null)
                user.Thumbnail = "";

            var identity = new ClaimsIdentity(context.Options.AuthenticationType);
            identity.AddClaim(new Claim(ClaimTypes.GivenName, user.FirstName + " " + user.LastName));
            identity.AddClaim(new Claim(ClaimTypes.Name, user.FirstName));
            //identity.AddClaim(new Claim(ClaimTypes.Role, user.Roles.ToString()));
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id));
            identity.AddClaim(new Claim(ClaimTypes.Email, user.Email));
            identity.AddClaim(new Claim("Thumbnail", user.Thumbnail));
            //identity.AddClaim(new Claim("IsDeleted", user.isDeleted.ToString()));
            //identity.AddClaim(new Claim("IsDisabled", user.isDisabled.ToString()));

            var props = new AuthenticationProperties(new Dictionary<string, string>
                {
                    {
                        "as:client_id", (context.ClientId == null) ? string.Empty : context.ClientId
                    },
                    {
                        "userName", user.UserName
                    }
                });
            var ticket = new AuthenticationTicket(identity, props);
            context.Validated(ticket);
            context.Validated(identity);

        }
    }
}