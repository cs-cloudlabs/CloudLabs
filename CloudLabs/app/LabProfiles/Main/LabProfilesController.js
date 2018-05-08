
(function (angular) {
    'use strict';
    angular.module('app-labprofiles')
        .controller('LabProfilesController', function ($scope, $filter, $window, svc, $uibModal, $route, $rootScope,$document, $timeout) {
            $scope.VETypes = [];
            $scope.VETemplates = [];
            $scope.labActivities = [];
            $scope.courseIds = [];
            $scope.profiles = [];
            $scope.empty = false;
            $scope.view = false;
            $scope.info = [];
            $scope.loading = true;
            $scope.loadingContent = false;
            var backup = [];
            var query = "";
            var pageSize = 0;
            var pageNum = 1;
            var chosenName = [];
            var chosenIds = [];
            var chosenType = [];
            var courseIds = 0;
            var activities = [];
            var chosenActivities = [];
            var startIndex = 0;
            var right = [];
            var length = 0;
            var htmlRef = angular.element($document[0].html);

            

            $scope.search = function (item) {
                if (!$scope.searchEntry || (item.Name.indexOf($scope.searchEntry.toLowerCase()) != -1)) {
                    return true;
                }
                return false;
            };

            $scope.filterDeleted = function (el) {
                return !el.flagDeleted;
            };




            var onLoadPage = function () {
                
                $scope.VETypes = [];
                $scope.VETemplates = [];
                $scope.labActivities = [];
                $scope.courseIds = [];
                $scope.profiles = [];
                $scope.empty = false;
                $scope.view = false;
                $scope.info = [];
                //
                var query = "";
               
                right = [];
                length = 0;
               
                svc.getLabProfiles(pageSize, pageNum, courseIds)
                    .then(function (response) {
                        angular.copy(response.VEProfiles, $scope.courseIds);
                    });
                

                svc.getVETypes()
                    .then(function (response) {
                        angular.copy(response, $scope.VETypes);
                        angular.forEach($scope.VETypes, function (key, value) {
                            svc.getVETemplates(key["VETypeID"])
                                .then(function (response) {
                                    $scope.VETemplates.push(response);                                    
                                });
                        });

                        svc.getLabActivities()
                            .then(function (response) {
                                angular.copy(response.LabActivities, $scope.labActivities);                                

                                right = $scope.labActivities;
                                length = $scope.labActivities.length;
                                angular.copy(response.LabActivities, backup);
                                if ($scope.VETemplates.length != 0 && $scope.courseIds.length != 0 && backup.length != 0) {
                                    if ($scope.courseIds.length < 12) {
                                        for (var i = 0; i < $scope.courseIds.length; i++) {
                                            $scope.profiles.push($scope.courseIds[i]);
                                        }
                                    }
                                    else {
                                        for (var i = 0; i < 12; i++) {
                                            $scope.profiles.push($scope.courseIds[i]);
                                        }
                                    }         
                                }
                               
                                $scope.loading = false;
                                $scope.loadingContent = false;
                                if ($scope.profiles.length == 0 && $scope.loading == false) {
                                    $scope.empty = true;
                                }
                            });                                                
                    });       
                }


            onLoadPage();

            $scope.loadMore = function () {
                var last = $scope.profiles.length;
                for (var i = 0; i < 4; i++) {
                    if (last + i == $scope.courseIds.length)
                        return;
                    $scope.profiles.push($scope.courseIds[last + i]);
                }
            }

            $scope.searchLabProfile = function () {
                if ($scope.entry != null) {
                    svc.searchLabProfiles($scope.entry, pageSize)
                        .then(function (response) {
                            angular.copy(response.VEProfiles, $scope.courseIds);
                        });
                }
                else {
                    svc.getLabProfiles(pageSize, pageNum, courseIds)
                        .then(function (response) {
                            angular.copy(response.VEProfiles, $scope.courseIds);
                        });
                }

            }

            $scope.openModal = function (type, info, VETypes, VETemplates, labActivities) {
                $uibModal.open({
                    animation: true,
                    templateUrl: '/app/LabProfiles/Modal/CreateModal.html',
                    controller: 'CreateModalController',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        type: function () {
                            return type;
                        },
                        info: function () {
                            return info;
                        },
                        types: function () {
                            return VETypes;
                        },
                        templates: function () {
                            return VETemplates;
                        },
                        activities: function () {
                            return activities;
                        },
                        activityNames: function () {
                            return chosenName;
                        },
                        chosenVEType: function () {
                            return chosenType;
                        },
                        startIndex: function () {
                            return startIndex;
                        }
                    }
                });
            }

            var info = [{ "name": "", "description": "" }];
            // attention here
            $scope.openCreateModal = function (type, index) {
                //backup.length = 0;
                chosenName.length = 0;
                chosenIds.length = 0;
                chosenType.length = 0;
                //activities.length = 0;
                chosenActivities.length = 0;

                $("html").css({ "overflow": "hidden" });
                htmlRef.addClass('ovh');
                angular.copy(backup, $scope.labActivities);
                if (type == 'create') {                    
                    info = [];
                    $scope.labActivities = $filter('orderBy')($scope.labActivities, 'Name', false);                  
                    activities = [[], $scope.labActivities];
                    
                    startIndex = 0;
                }
                else {

                    if (!$scope.searchEntry) {
                        var x = $scope.courseIds[index];
                        info = x;
                    }
                    else {       
                        var x = index;
                        info = x;
                    }
                    

                    svc.getProfileActivities(x.VEProfileID)
                        .then(function (response) {
                            angular.copy(response, chosenActivities);
                            angular.forEach(response, function (key, value) {
                                chosenName.push(activities[0][value].Name);
                                chosenIds.push(activities[0][value].LabActivityID);
                            });
                            angular.forEach(chosenActivities, function (value1, key1) {                                
                                angular.forEach($scope.labActivities, function (value2, key2) {
                                    if (value1.LabActivityID == value2.LabActivityID) {
                                        $scope.labActivities.splice(key2, 1);
                                    }
                                });                                
                            });
                            $rootScope.$emit('loaded');
                        });
                   

                    angular.forEach($scope.VETypes, function (key, value) {
                        if (key.VETypeID == 1)
                            chosenType.push(key);    
                    });


                    $scope.labActivities = $filter('orderBy')($scope.labActivities, 'Name', false);                     
                    activities = [chosenActivities, $scope.labActivities];

                    if (type == 'edit') 
                        startIndex = 0;
                    else if (type == 'view') 
                        startIndex = 3;

                   
                }
                
                $scope.openModal(type, info, $scope.VETypes, $scope.VETemplates, $scope.labActivities);
               
            }

            $scope.openConfirmationModal = function (type, para1, para2) {
                var modalData = {};

                switch (type) {                    
                    case 'delete':
                        modalData = {
                            type: type,
                            message: "Are you sure you want to delete " + para2 + "?",
                            title: "Delete Lab Profile",
                            VEProfileID: para1,
                            Name: para2                            
                        };
                        break;
                }
                
                var modal = $uibModal.open({
                    templateUrl: '/app/Common/ConfirmationModal.html',
                    controller: "ConfirmationModalController",
                    controllerAs: '$confmodal',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: true,
                    resolve: {
                        items: function () {
                            return modalData;
                        }
                    }
                });
            };
            $rootScope.$on('loadContent', function () {
                $scope.loadingContent = true;
                $timeout(function () { onLoadPage();}, 1000);
                
            });
            $rootScope.$on('fauxLoad', function () {
                $scope.loadingContent = true;
            });
            
        })

        
    
    
})(window.angular);


