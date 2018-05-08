(function () {

    "use strict";

    angular.module('app-labprofiles')
        .controller('ConfirmationModalController', function ($uibModalInstance, $rootScope, $scope, items, svc, $window, $route,$uibModalStack) {
            var $confmodal = this;
            $confmodal.title = items.title;
            $confmodal.message = items.message;  

            $confmodal.confirm = function () {
                $uibModalInstance.close(true);
                $uibModalStack.dismissAll();
                $rootScope.$emit('fauxLoad');
            if (items.type == 'delete') {
                //$confmodal.centered = true;
                svc.deleteLabProfile(items).then(function (response) {
                    $("html").removeAttr('style');
                    $rootScope.$emit('loadContent');
                    
                })
                    .finally(function () {
                        
                });
            }
            else if (items.type == 'create') {    
                Save("",items);
            }
            else if (items.type == 'edit') {
                Save(items.VEProfileID, items);
            }             
                      
        };

        $confmodal.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };


        var Save = function (ProfileId, info) {

            if (info.type == 'create') {
                var labProfileDetails =
                    {
                        VEProfileID: ProfileId,
                        VirtualEnvironmentID: info.VirtualEnvironmentID,
                        Name: info.Name,
                        Description: info.Description,
                        ConnectionLimit: 100,
                        CourseID: 1,
                        ThumbnailUrl: null,
                        DateProvisionTrigger: "2016-04-01 00:00:00",
                        IsEnabled: 1,
                        Status: 0,
                        Remarks: null,
                        IsEmailEnabled: 0,
                        PassingRate: 0,
                        ExamPassingRate: 0,
                        ShowExamPassingRate: 0,
                    };
            }

            else if (info.type == 'edit') {
                var labProfileDetails =
                    {
                        VEProfileID: ProfileId,
                        VirtualEnvironmentID: info.VirtualEnvironmentID,
                        Name: info.Name,
                        Description: info.Description,
                        ConnectionLimit: info.ConnectionLimit,
                        CourseID: info.CourseID,
                        ThumbnailUrl: info.ThumbnailUrl,
                        DateProvisionTrigger: info.DateProvisionTrigger,
                        IsEnabled: info.IsEnabled,
                        Status: info.Status,
                        Remarks: info.Remarks,
                        IsEmailEnabled: info.IsEmailEnabled,
                        PassingRate: info.PassingRate,
                        ExamPassingRate: info.ExamPassingRate,
                        ShowExamPassingRate: info.ShowExamPassingRate,
                    };
            }

            if (!angular.isString(info.picFile)) {
                if (info.picFile == undefined)
                    info.picFile = "";
                svc.uploadImage(info.picFile).then(                    
                        function (response) {
                            labProfileDetails.ThumbnailUrl = response;     
                            createLabProfile(labProfileDetails, info.type);
                        }
                    );
            }
            else {
                labProfileDetails.ThumbnailUrl = info.ThumbnailUrl;
                createLabProfile(labProfileDetails, info.type);
                }
            
        }

        var createLabProfile = function (labProfileDetails, type) {
            svc.createLabProfile(labProfileDetails, type)
                .then(function (response) {
                    $uibModalInstance.close(response);
                    $("html").removeAttr('style');
                    $uibModalStack.dismissAll();
                    $rootScope.$emit('fauxLoad');
                    
                    var addLabActivity = {
                        VEProfileID: response.VEProfileID,
                        LabActivities: items.labActivities
                    };

                    if (type == 'create') {
                        svc.bindLabActivities(addLabActivity)
                            .then(function (response) {
                                return response;                                
                            });
                    }

                    else if (type == 'edit'){
                        svc.updateLabActivities(addLabActivity)
                            .then(function (response) {
                                return response;
                            });
                    }
                    $rootScope.$emit('loadContent');                                

                    //$uibModalInstance.close(true);
                    //$rootScope.$emit('loadContent');
                    //$uibModalStack.dismissAll();
            
            })
        };


        });

  

})();