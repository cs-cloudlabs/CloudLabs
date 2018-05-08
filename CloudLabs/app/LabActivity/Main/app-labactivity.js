(function (angular) {

    "use strict";
   
    angular.module("app-labactivity", ["main-app", "ngRoute", "ui.bootstrap", "ui.tinymce", "textAngular"])
        .config(function ($routeProvider) {

            $routeProvider.when("/", {
                controller: "LabActivityController",
                templateUrl: "/app/LabActivity/Main/LabActivityView.html" 
            });

            $routeProvider.otherwise({ redirectTo: "/" });
  
   
    });
})(window.angular);