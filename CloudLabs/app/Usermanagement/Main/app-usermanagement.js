(function () {

    "use strict";

    angular.module("app-Usermanagement", ["main-app", "ngRoute", "ui.bootstrap"])
    .config(function ($routeProvider) {
        $routeProvider.when("/", {
            controller: "UsermanagementController",
            templateUrl: "/app/Usermanagement/Main/UsermanagementView.html",
        });       
    });
})();
