
(function () {

    "use strict";

    angular.module("app-register", ["main-app", "ngRoute"])
        .config(function ($routeProvider) {

            $routeProvider.when("/", {
                controller: "RegisterController",
                templateUrl: "/app/RegisterPage/RegisterView.html"
            });
            $routeProvider.otherwise({ redirectTo: "/" });
        });
})();