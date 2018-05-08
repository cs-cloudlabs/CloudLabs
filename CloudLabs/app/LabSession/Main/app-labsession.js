(function (angular) {

    "use strict";
   
    angular.module("app-labsession", ["main-app", "ngRoute", "ui.bootstrap", "textAngular"])
        .config(function ($routeProvider) {

            $routeProvider.when("/", {
                controller: "LabSessionController",
                templateUrl: "/app/LabSession/Main/LabSessionView.html" 
            });

            $routeProvider.otherwise({ redirectTo: "/" });
        })
})(window.angular);