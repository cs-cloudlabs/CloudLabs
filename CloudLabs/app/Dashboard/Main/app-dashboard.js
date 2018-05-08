
(function () {

    "use strict";

    angular.module("app-dashboard", ["main-app", "ngRoute"])
        .config(function ($routeProvider) {

            $routeProvider.when("/", {
                controller: "DashboardController",
                templateUrl: "/app/Dashboard/Main/DashboardView.html"
            });
            $routeProvider.otherwise({ redirectTo: "/" });
        });
})();