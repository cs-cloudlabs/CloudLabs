
(function (angular) {
    'use strict';
    angular.module('app-labsession')
        .controller('UserNotificationController', function ($scope, $uibModalInstance, $route, $uibModalStack) {
            
            $scope.close = function () {
                $uibModalInstance.close();
                $uibModalStack.dismissAll();
                $route.reload();
            }


        })
})(window.angular);
