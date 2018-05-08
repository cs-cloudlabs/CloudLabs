using System.Web;
using System.Web.Optimization;

namespace CloudSwyft.CloudLabs
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery/jquery-{version}.js",
                        "~/Scripts/jquery.cookie.js",
                        "~/Scripts/app.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery/jquery.validate*"));

            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.min.js",
                      "~/Scripts/respond.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.min.css"
                      , "~/Content/site.css"));

            bundles.Add(new ScriptBundle("~/bundles/angular").Include(
                        "~/Scripts/angular/angular.min.js"
                        , "~/Scripts/angular-route/angular-route.min.js"
                        , "~/Scripts/angular-ui/ui-bootstrap.min.js"
                        , "~/Scripts/angular-ui/ui-bootstrap-tpls.min.js"
                        , "~/Scripts/ng-infinite-scroll/ng-infinite-scroll.min.js"
                        , "~/Scripts/ng-file-upload/ng-file-upload-shim.min.js"
                        , "~/Scripts/ng-file-upload/ng-file-upload.min.js"
                        , "~/Scripts/angular-animate/angular-animate.js"
                        , "~/Scripts/angular-toggle/angular-bootstrap-toggle.js"
                        , "~/Scripts/shared/site.js"
                        , "~/Scripts/shared/moment.js"));

            bundles.Add(new ScriptBundle("~/bundles/cookies").Include(
                        "~/Scripts/angular-cookies/angular-cookies.min.js"));
        }
    }
}
