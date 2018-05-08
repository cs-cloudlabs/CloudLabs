(function () {

    "use strict";

    angular.module('app-labprofiles')
        .controller('ActivityViewController', function ($uibModalInstance, $rootScope, $scope, items, svc, $window) {
            var $viewmodal = this;                     
            $viewmodal.title = items.Name;
            $scope.message = items.TasksHtml;  
            
        
            $viewmodal.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        });

  

})();