/// <reference path="usernotificationcontroller.js" />
/// <reference path="viewrenderimagecontroller.js" />
/// <reference path="viewrenderimagecontroller.js" />

(function (angular) {
    'use strict';
    angular.module('app-labsession')
        .controller('RenderPageController', function ($scope, $injector, $location, svc, item, $sce, $uibModalInstance, $uibModal, content, userId, profileId, $anchorScroll, $timeout, $document) {

            $scope.isLoading = true;
            $scope.showLabActivities = true;
            $scope.index = 0;
            $scope.tasks = [];
            $scope.copytask = [];
            $scope.test = [];
            var rex = /src\=[\"\']?([a-zA-Z0-9 \:\-\#\(\)\.\_\/\;\'\,]+)\;?[\"\']?/ig
            //var rex = /src\\s*=\\s*\"(.+)?\"/ig
            var arr = [];
            var htmlRef = angular.element($document[0].html);  
            

            angular.forEach(content[0], function (key, value) {
                $scope.tasks.push({ "TaskDetails": key["TasksHtml"] });
            });

            //starts loop for every task page
            angular.forEach($scope.tasks, function (key, value) {
                arr = [];
                var rex = /src\=[\"\']?([a-zA-Z0-9 \:\-\#\(\)\.\_\/\;\'\,]+)\;?[\"\']?/ig
                while ((arr = rex.exec($scope.tasks[value]["TaskDetails"])) != null) {
                    if (($scope.tasks[value]["TaskDetails"]).indexOf("src") >= 0) {
                        var imgr = ($scope.tasks[value]["TaskDetails"]).split(" ");
                        angular.forEach(imgr, function (key1, value1) {
                            if (imgr[value1].indexOf("src") >= 0) {
                                var blobSrc = key1.split('=');
                                imgr[value1] += " onclick=\"viewImage('" + blobSrc[1].replace(/"/g, "") + "')\"";
                            }
                        })

                        $scope.tasks[value]["TaskDetails"] = imgr.join(" ");
                        break;
                    }
                }
            });

            $scope.viewImage = function (src) {

                $uibModal.open({
                    animation: true,
                    templateUrl: '/app/LabSession/RenderPage/ViewRenderImageView.html',
                    controller: 'ViewRenderImageController',
                    size: 'xl',
                    backdrop: 'static',
                    windowClass: 'image-view',
                    keyboard: false,
                    resolve: {
                        source: function () {
                            return src;
                        }
                    }
                });
            };

            $scope.checkMachineStatus = function () {
                svc.getProvisionedDetails(userId, profileId).then(function (response) {
                    if (response[0]["IsStarted"] == 6 || response[0]["IsStarted"] == 0) {
                        $scope.userNotification();
                    }
                    else
                        $timeout(function () {
                            $scope.checkMachineStatus();
                        }, 10000);
                });

            };

            $scope.userNotification = function () {
                $("html").css({ "overflow": "hidden" });
                htmlRef.addClass('ovh');
                $uibModal.open({
                    templateUrl: '/app/LabSession/RenderPage/UserNotificationView.html',
                    controller: "UserNotificationController",
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false,
                    windowClass: 'notification-modal',
                });
            }

            $scope.focusMove = function () {
                angular.element('#iRender').focus();
            }
            $scope.guacamoleUrl = $sce.trustAsResourceUrl(item);

            $scope.clickedLab = function () {
                $scope.showLabActivities = !$scope.showLabActivities;

            };
            $scope.close = function () {
                $uibModalInstance.dismiss();
                $scope.tasks.length = 0;
                content.length = 0;
            };
            $scope.btnNext = function () {
                $scope.index = ($scope.index + 1) % $scope.tasks.length;
                var ele = angular.element(document.querySelector('#divID'));
                $scope.resetScroll(ele);
            };  

            $scope.btnPrev = function () {
                if ($scope.index <= 0)
                    $scope.index = $scope.tasks.length;
                $scope.index = ($scope.index - 1) % $scope.tasks.length;
                var ele = angular.element(document.querySelector('#divID'));
                $scope.resetScroll(ele);
            };

            $timeout(function () {
                $scope.checkMachineStatus();
            }, 10000);

            $scope.resetScroll = function link(ele) {
            angular.element(ele)[0].scrollTop = 0;
            }

            

        })
})(window.angular);
