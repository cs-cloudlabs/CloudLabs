
(function (angular) {
    'use strict';
    angular.module('app-labsession')
        .controller('ViewRenderImageController', function ($scope, $uibModalInstance, source) {


            $scope.source = source;

            $scope.close = function () {
                $uibModalInstance.close();
            }


        })
})(window.angular);
