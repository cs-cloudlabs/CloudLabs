(function () {

    "use strict";
    angular.module("app-labprofiles")
        .controller("CreateModalController", function ($scope, $filter, $uibModalInstance, $route, $uibModal, $http, $rootScope, $uibModalStack, $timeout, svc, types, templates, activities, type, info, startIndex, activityNames, chosenVEType,Upload) {
            $scope.index = 0;
            var Id = 0;
            var listA = [];
            var valid;
            var Tempindex = 0;
            var counter = 0;
            $scope.VETypes = types;
            $scope.VETemplates = templates;
            $scope.index = startIndex;
            $scope.model = activities;
            $scope.step1 = true;
            $scope.hideNext = true;
            $scope.hidePrevious = false;
            $scope.hideSave = false;
            $scope.Templates = true;           
            $scope.OSTemplates = [];
            $scope.machinesLoaded = false;
            $scope.loading2 = true;
            $scope.actLoading = true;
            $scope.type = type;           
            $scope.chosenIds = [];            
            $scope.chosenActivities = activityNames;
            $scope.chosenOS = chosenVEType[0];
            $scope.chosenTemplate = info.VirtualEnvironment;
            $scope.profileName = info.Name;
            $scope.profileDescription = info.Description;
            $scope.picFile = info.ThumbnailURL;
            $scope.showRemove = false;
            $scope.imgText = false;
            $scope.imgPreview = true;
            $scope.imgLarge = false;
     
            
            var leftSide = [];

            $scope.slickConfig = {
                enabled: true,
                autoplay: false,
                draggable: false,
                method: {},
                event: {
                    beforeChange: function (event, slick, currentSlide, nextSlide) {
                        
                    },
                    afterChange: function (event, slick, currentSlide, nextSlide) {
                        
                    },
                    
                }
            };

            $scope.fixSlick = function ()
            {       
                if ($scope.chosenTemplate) {
                    $scope.machinesLoaded = true;
                    Tempindex = $scope.OSTemplates.findIndex(x => x.Title === $scope.chosenTemplate.Title);                    
                    $('#test').slick('resize');                    
                    $timeout(function () { $('#test').slick('slickGoTo', parseInt(Tempindex));},  100);
                }
                else
                   $timeout(function () { $scope.machinesLoaded = true; }, 950);                
            };

            $rootScope.$on('loaded', function () {
                $scope.loading2 = false;
                $scope.actLoading = false;
            });

            $scope.chooseTemplate = function (x) {
                $scope.chosenTemplate = x;
                $scope.Template = false;
            }   
            $scope.selectTemplate = function (item) {
                $scope.selected = item;
            };

            $scope.selectOS = function (item) {
                if ($scope.selectedOS != item) {                   
                    $scope.machinesLoaded = false;
                    $scope.selectedOS = item;
                    $scope.OS = false;
                }
            };

            $scope.chooseOS = function (y) {          
              
                    if ($scope.chosenOS == y && $scope.OSTemplates.length != 0)
                    return;
                
                    $scope.OSTemplates = [];               
                    $scope.chooseTemplate(null);
                    $scope.selectTemplate(null);
                    if (type != 'edit') {
                    $scope.OSTemplates.length = 0
                }
                $scope.Templates = true;
                $scope.chosenOS = y;

                angular.forEach(templates, function (value, key) {
                    angular.forEach(value, function (value2, key2) {
                        if (value2.VETypeID == y.VETypeID) {
                            $scope.OSTemplates.push(value2);
                        }
                    });
                });
                if ($scope.OSTemplates.length > 0) {         
                    $scope.fixSlick();
                }                
            }
          
            $scope.isActiveOS = function (item) {
                return $scope.selectedOS == item;
            };
            $scope.isActiveTemplate = function (item) {
                return $scope.selected == item;
            };

            $scope.checkValidity = function (file) {
                $scope.showRemove = false;

                if (file > 3145728) {                    
                    $scope.imgPreview = false;
                    $scope.imgLarge = true;
                }
                else if (file == undefined)
                    $scope.imgLarge = true;

                else {
                    $scope.imgPreview = true;
                    $scope.imgLarge = false;
                    $scope.showRemove = true;
                }

                
            }

               
            if (info.ThumbnailURL || $scope.picFile) {
                $scope.showRemove = true;
            }

            $scope.leftList = function () {
                
                $scope.chosenActivities.length = 0;
                $scope.chosenIds.length = 0;
                var elements = recursiveArraySearch($scope.model[0], function (el) { return true; });                
                for (var i = 0; i < elements.length; i++) {
                    $scope.chosenIds.push(elements[i])
                    $scope.chosenActivities.push(elements[i].Name);
                    leftSide = elements;                    
                }                  
                
                if ($scope.model[0].length != 0 || $scope.chosenActivities.length == 0) {
                    $scope.Act = false;                   
                }
                else 
                    $scope.Act = true;      

                
            }

            $scope.onMoved = function (list, index) {
                $scope[list].splice(index, 1);
                $scope[list] = $scope[list].filter(function (item) { return !item.selected; });
            };

            


            var onLoadPage = function () {                

                if (startIndex == 3) {
                    $scope.hideNext = false;
                }

                if (type == 'create') {
                    $scope.modalTitle = "Create Lab Profile";
                    $scope.loading2 = false;
                    $scope.chosenOS = null;
                    $scope.OSTemplates = 1;
                    $scope.actLoading = false;
                    

                }

                else if (type == 'edit') {
                    $scope.modalTitle = "Edit Lab Profile";
                    $scope.leftList();                    
                    $scope.chooseOS(chosenVEType[0]);
                    $scope.selectOS(chosenVEType[0]);
                    $scope.chooseTemplate(info.VirtualEnvironment);
                      
                    
                }

                else if (type == 'view')
                    $scope.modalTitle = "View Lab Profile";
                    $scope.view = true;
                    
                
            }

            onLoadPage();

            $scope.openViewActivityModal = function (content) {
                var modal = $uibModal.open({
                    templateUrl: '/app/LabProfiles/Modal/ActivityView.html',
                    controller: "ActivityViewController",
                    controllerAs: '$viewmodal',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: true,
                    resolve: {
                        items: function () {
                            return content;
                        }
                    }
                });    
            }
           



            $scope.openConfirmationModal = function (profileName, profileDescription) {
                if ($scope.imgLarge == true)
                    $scope.picFile = null;

                if (type == 'create') {                    
                    var createModalData = {
                        Name: profileName,
                        Description: profileDescription,
                        VirtualEnvironmentID: $scope.chosenTemplate.VirtualEnvironmentID,
                        title: "Create Lab Profile",
                        message: "Are you sure the details provided are correct?",
                        type: type,
                        labActivities: $scope.chosenIds,
                        picFile: $scope.picFile
                    }

                    $scope.Act = true;
                }
                else if (type == 'edit') {
                    if ($scope.chosenIds.length !=0) {
                        var createModalData = {

                            VEProfileID: info.VEProfileID,
                            VirtualEnvironmentID: $scope.chosenTemplate.VirtualEnvironmentID,
                            Name: profileName,
                            Description: profileDescription,
                            ConnectionLimit: info.ConnectionLimit,
                            CourseID: info.CourseID,
                            ThumbnailUrl: info.ThumbnailURL,
                            DateProvisionTrigger: info.DateProvisionTrigger,
                            IsEnabled: info.IsEnabled,
                            Status: info.Status,
                            Remarks: info.Remarks,
                            IsEmailEnabled: info.IsEmailEnabled,
                            PassingRate: info.PassingRate,
                            ExamPassingRate: info.ExamPassingRate,
                            ShowExamPassingRate: info.ShowExamPassingRate,
                            title: "Edit Lab Profile",
                            message: "Are you sure you want to edit " + info.Name + "?",
                            type: type,
                            labActivities: $scope.chosenIds,
                            picFile: $scope.picFile
                        }
                    }
                    else {
                        var createModalData = {

                            VEProfileID: info.VEProfileID,
                            VirtualEnvironmentID: $scope.chosenTemplate.VirtualEnvironmentID,
                            Name: profileName,
                            Description: profileDescription,
                            ConnectionLimit: info.ConnectionLimit,
                            CourseID: info.CourseID,
                            ThumbnailUrl: info.ThumbnailURL,
                            DateProvisionTrigger: info.DateProvisionTrigger,
                            IsEnabled: info.IsEnabled,
                            Status: info.Status,
                            Remarks: info.Remarks,
                            IsEmailEnabled: info.IsEmailEnabled,
                            PassingRate: info.PassingRate,
                            ExamPassingRate: info.ExamPassingRate,
                            ShowExamPassingRate: info.ShowExamPassingRate,
                            title: "Edit Lab Profile",
                            message: "Are you sure you want to edit " + info.Name + "?",
                            type: type,
                            labActivities: activities[0],
                            picFile: $scope.picFile
                        }
                    }
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
                            return createModalData;
                        }
                    }
                });              
            };       

            $scope.onDrop = function (srcList, srcIndex, targetList, targetIndex, query) {       
                if (query) {                    
                    var srcListOld = srcList;
                    var srcList = $filter('filter')(srcList, { 'Name': query });
                    angular.forEach(srcListOld, function (value, key) {
                        if (value == srcList[srcIndex]) {
                            srcListOld.splice(key,1);
                        }
                    });
                    targetList.splice(targetIndex, 0, srcList[srcIndex]);
                    if (srcList == targetList && targetIndex <= srcIndex) srcIndex++;
                    srcList.splice(srcIndex, 1);
                    srcList = srcListOld;
                }
                else {
                    targetList.splice(targetIndex, 0, srcList[srcIndex]);
                    if (srcList == targetList && targetIndex <= srcIndex) srcIndex++;
                    srcList.splice(srcIndex, 1);
                }                
                $scope.leftList();
                return true;                   
            };
            $scope.searchingActivity = function (query) {
                $scope.SearchActivity = query;
            }

            if (info.ThumbnailURL || $scope.picFile) {
                $scope.showPreview = true;
            }

            
           
            

            function recursiveArraySearch(arr, filter) {
                var result = [];
                //change
                
                for (var i = 0; i < arr.length; i++) {
                    var el = arr[i];
                    if (el instanceof Array) result = result.concat(recursiveArraySearch(el, filter));
                    else filter(el) && result.push(el);
                }                            
                return result;
                
            }

            $scope.nextStep = function (validity, pic) {
                $scope.imgLarge = false;
                valid = false;
                
                if ($scope.index == 0) {
                    $scope.fixSlick();
                    $scope.selectTemplate($scope.OSTemplates[Tempindex]);

                    if (validity || pic > 3145728)
                        $scope.imgLarge = true;
                    

                    if (!$scope.profileName || !$scope.profileDescription || $scope.imgLarge == true) {
                        if (!$scope.profileName) {
                            $scope.page1.profileName.$invalid = true;
                            $scope.page1.profileName.$dirty = true;
                            valid = false;
                        }
                        if (!$scope.profileDescription) {
                            $scope.page1.profileDescription.$invalid = true;
                            $scope.page1.profileDescription.$dirty = true;
                            valid = false;
                        }
                        if ($scope.imgLarge) {
                            valid = false;
                        }
                    }
                    else                       
                            valid = true;
                       
                }
                else if ($scope.index == 1) {
                    
                    if (!$scope.chosenOS) {
                        $scope.OS = true;
                        $scope.Template = false;
                    }
                    else if (!$scope.chosenTemplate) {
                        $scope.Template = true;
                    }
                    else
                        valid = true
                }

                else if ($scope.index == 2) {
                    if ($scope.model[0].length == 0) {
                        $scope.Act = true;
                    }
                    else
                        valid = true;
                }
               

                if (valid == true) {
                    if(type == 'edit')
                        $scope.selectOS(chosenVEType[0]);

                    $scope.index = $scope.index + 1;
                    $scope.hideNext = true;
                    $scope.hidePrevious = true;
                   
                }


                if ($scope.index > 2) {
                    $scope.hideSave = true;
                    $scope.hideNext = false;
                }
            }

            $scope.previousStep = function () { 
                valid = true;
                $scope.index = $scope.index - 1;
                if ($scope.index == 1)
                    $scope.fixSlick();
                $scope.hideNext = true;
                $scope.hideSave = false;
                if ($scope.index <= 0) {
                    $scope.hideNext = true;
                    $scope.hidePrevious = false;
                }
               
            }
            

            $scope.close = function () {             
                $("html").removeAttr('style');
                $uibModalInstance.close();
                $scope.view = false;
                $scope.index = 0;
                $scope.chosenActivities.length = 0;
                $scope.machinesLoaded = true;
                $scope.Act = false;
                $scope.actLoading = true;
                $scope.imgPreview = true;
                $scope.imgLarge = false;
                Tempindex = 0;
               
                
                    for (var i = 0; i < leftSide.length; i++) {
                        $scope.model[1].push(leftSide[i]);
                    }

                    $scope.model[1] = $filter('orderBy')($scope.model[1], 'Name', false);
                
            };

        });
})();

