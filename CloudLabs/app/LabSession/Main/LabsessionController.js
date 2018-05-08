(function (angular) {
    'use strict';
    angular.module('app-labsession')
        .controller('LabSessionController', function ($scope, $window, svc, $timeout, $uibModal, $document) {
            $scope.empty = false;
            $scope.loading = true;
            $scope.labs = [];
            $scope.labContent = [];
            $scope.showLabStart = [];
            $scope.userId = 0;
            $scope.labveprofileid = 0;

            var windowHeight = $(window).height();
            var machineStatus = null;
            var contents = []
            var htmlRef = angular.element($document[0].html);

            svc.getMe()
                .then(function (response) {
                    $scope.userId = response.data.userId;
                    svc.GetProvisionedVeprofilesByUser($scope.userId)
                        .then(function (response) {
                            if (response.length != 0) {
                                angular.copy(response, $scope.labs);
                                for (var i = 0; i < $scope.labs.length; i++) {
                                    $scope.showLabStart.push(false);
                                }
                            }
                        });
                    $scope.userProvision($scope.userId);
                })


            $scope.userProvision = function userProvision(userid) {
                svc.GetProvisionedVeprofilesByUser(userid)
                    .then(function (response) {
                        angular.copy(response, $scope.labs);
                        $scope.showLabStart.push(false);
                        $scope.loading = false;
                        if ($scope.labs.length == 0) {
                            $scope.empty = true;
                        }
                    });
            };

            $scope.startVM = function (veProfileId) {
                svc.startVM($scope.userId, veProfileId)
                    .then(function (response) {
                    });
            }

            $scope.loadModal = function (i) {
                $("html").css({ "overflow": "hidden" });
                htmlRef.addClass('ovh');
                svc.getProfileActivities(i)
                    .then(function (response) {
                        contents.push(response);
                        if (contents.length != 0) {
                            $scope.loading2 = false;
                            $scope.loading = false;
                            $uibModal.open({
                                templateUrl: '/app/LabSession/RenderPage/RenderPageView.html',
                                controller: "RenderPageController",
                                size: 'md',
                                backdrop: 'static',
                                keyboard: false,
                                windowClass: 'app-modal-window',
                                resolve: {
                                    item: function () {
                                        return $scope.guacamoleURL
                                    },
                                    content: function () {
                                        return contents;
                                    },
                                    userId: function () {
                                        return $scope.userId
                                    },
                                    profileId: function () {
                                        return $scope.labveprofileid
                                    },
                                },
                            });
                        }

                    });
            }







            $scope.getProvision = function (userId, veProfileId) {
                $scope.loading2 = true;
                svc.getProvisionedDetails(userId, veProfileId).then(function (response) {
                    if (response[0]["IsStarted"] == 1) {
                        $scope.ifStarted = true;
                        if ($scope.calledStartVM) {
                            $timeout(function () {
                                $scope.loadModal(veProfileId);
                            }, 60000);
                        }
                        else
                            $scope.loadModal(veProfileId);
                    }
                    else if (response[0]["IsStarted"] == 6) {
                        $scope.ifStarted = false;
                        $scope.loading2 = true;
                        $scope.getProvision($scope.userId, veProfileId);
                    }
                    else {
                        if (!$scope.calledStartVM) {
                            $scope.startVM(veProfileId);
                            $scope.calledStartVM = true;
                        }
                        $scope.ifStarted = false;
                        $scope.loading2 = true;
                        $scope.getProvision($scope.userId, veProfileId);
                    }

                })
            }
            $scope.openLab = function openLab(i) {
                $scope.labContent.length = 0;
                $scope.loading2 = true;
                $scope.ifStarted = true;
                $scope.calledStartVM = false;
                $scope.labveprofileid = i.veprofileid;

                svc.getProvisionedDetails($scope.userId, $scope.labveprofileid).then(function (response) {
                    $scope.guacamoleURL = response[0].GuacamoleInstance["Url"];
                    machineStatus = response[0]["IsStarted"];
                })

                $scope.getProvision($scope.userId, $scope.labveprofileid);    
                
            };

           

            

            $scope.showStartLab = function showStartLab(i) {
                $scope.showLabStart[i] = true;
            }

            $scope.hideStartLab = function hideStartLab(i) {
                $scope.showLabStart[i] = false;
            }


        })
})(window.angular);