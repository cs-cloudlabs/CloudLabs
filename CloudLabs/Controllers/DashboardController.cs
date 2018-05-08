using System.Web.Mvc;
using System.Security.Claims;
using System.Threading;
using System.Linq;
using System.Threading.Tasks;
using CloudSwyft.CloudLabs.Models;

namespace CloudSwyft.CloudLabs.Controllers
{
    [Authorize]
    public class DashboardController : Controller
    {

        public ActionResult Index()
        {
            //testing comment
            if (User.IsInRole("Student"))
                return RedirectToAction("Index", "Labsession");
            else
                return View();
        }
    }
}