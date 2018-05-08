using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Configuration;
using System.Threading.Tasks;
using LtiLibrary.Core.Lti1;
using LtiLibrary.AspNet.Extensions;
using CloudSwyft.CloudLabs.Models;
using CloudSwyft.CloudLabs.Helpers;
using System.Web.Routing;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json;

namespace NewVE.Controllers
{   
    
    public class LabSessionController : Controller
    {
        public string authServer = System.Configuration.ConfigurationManager.AppSettings["CloudSwyftAuthServerUrl"];

        public ActionResult Index()
        {
           
            return View();
        }
        //[Authorize]
        public ActionResult LTIView()
        {
            var lti = new LtiRequest();
            lti.ParseRequest(Request); //request has the details sent by the LMS, in this case blackboard. this contains many information. by using parserequest it will put the details in an object
            var roles = lti.GetRoles();
            var sig = Request.GenerateOAuthSignature("pr0v3byd01n6!");

            if (sig.Equals(lti.Signature))
            {
                var x = lti;
            }

            return RedirectToAction("Labsession", "LTIView");
        }
    }
}