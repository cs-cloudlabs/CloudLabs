(function () {

    "use strict";
    angular.module("app-Usermanagement")
        .controller("UsermanagementController", function ($scope, $uibModal, $route, $http, svc, $filter, $window, $cookies) {
            $scope.sortReverse = false;
            $scope.sortType = '';
            $scope.showEdit = true;
            $scope.sortName = false;
            //$scope.profile = "../../Content/images/profile.png";
            $scope.validRole = false;
            $scope.hideShowClass = "outer-box";

            $scope.showPanel = false;
            $scope.showPanelTitle = "SHOW";
            $scope.createdByUsers = [];
            $scope.isLoading = false;
            $scope.userManagementUsers = [];
            var userObject = $scope.userManagementUsers;
            $scope.roles = [];
            $scope.showPage = false;
            $scope.status = [ "Active", 'InActive'];
            var userManagementFiltered;
            var roleOptions;
            

            $scope.loadMainTable = function () {
                $scope.searchMsg = "";
                if ($scope.isLoading)
                    return;
                $scope.length = 0;
                $scope.isLoading = true;

                svc.getMe().then(
                    function (response) {
                        svc.roleCloudOptions(response.data.role).then(
                            function (responseResult) {
                                angular.copy(responseResult, $scope.roles);
                                roleOptions = $scope.roles;
                            })
                        if (response.data.role == "SuperAdmin" || response.data.role == "Instructor")
                            $scope.validRole = true;
                        else
                            $scope.validRole = false;

                        svc.GetUsersCloudLabs(response.data.id, response.data.role).then(
                            function (result) {
                                angular.copy(result, $scope.userManagementUsers)
                                angular.forEach($scope.userManagementUsers, function (value, key) {
                                    if ($scope.userManagementUsers[key].IsDisabled)
                                        $scope.userManagementUsers[key].IsDisabled = "InActive";
                                    else
                                        $scope.userManagementUsers[key].IsDisabled = "Active";
                                }); 
                                if ($scope.userManagementUsers.length > 0) {
                                    $scope.isLoading = false;
                                    $scope.length = $scope.userManagementUsers.length;
                                    userManagementFiltered = $scope.userManagementUsers;
                                    $scope.userManagementUsers = $filter('orderBy')(userManagementFiltered, 'Firstname', false);
                                    $scope.showPage = false;

                                }
                                else {
                                    $scope.searchMsg = "No user profiles found.";
                                    $scope.showPage = true;
                                }
                            }
                        )
                    });       
            };

            $scope.loadMainTable();

            $scope.caretShow = true;
            $scope.caretChange = {
                Name: false,
                Email: false,
                Role: false,
                Status: false,
                CreatedBy: false,
                DateCreated: false,
                UpSideDown: false
            }

            $scope.defaultCaretChange = {
                Name: false,
                Email: true,
                Role: true,
                Status: true,
                CreatedBy: true,
                DateCreated: true,
                UpSideDown: true
            }

            var caretChange = function (a) {
                for (var x in $scope.caretChange) {
                    if (x == a)
                        $scope.caretChange[x] = !$scope.caretChange[x];
                    else
                        $scope.caretChange[x] = false;
                }
                for (var y in $scope.defaultCaretChange) {
                    if (y == a)
                        $scope.defaultCaretChange[y] = false;
                    else
                        $scope.defaultCaretChange[y] = true;
                }
            }
            $scope.tableSort = function (a) {
                caretChange(a);
                switch (a) {
                    case 'Name': {
                        $scope.caretShow = !$scope.caretShow;
                        $scope.sortType = 'Name';
                        $scope.sortReverse = !$scope.sortReverse;
                        break;
                    }
                    case 'Email': {
                        $scope.caretShow = !$scope.caretShow;
                        $scope.sortType = 'Email';
                        $scope.sortReverse = !$scope.sortReverse;
                        break;
                    }
                    case 'Role': {
                        $scope.caretShow = !$scope.caretShow;
                        $scope.sortType = 'Role';
                        $scope.sortReverse = !$scope.sortReverse;
                        break;
                    }
                    case 'Status': {
                        $scope.caretShow = !$scope.caretShow;
                        $scope.sortType = 'isDisabled';
                        $scope.sortReverse = !$scope.sortReverse;
                        break;
                    }
                    case 'CreatedBy': {
                        $scope.caretShow = !$scope.caretShow;
                        $scope.sortType = 'CreatedBy';
                        $scope.sortReverse = !$scope.sortReverse;
                        break;
                    }
                    case 'DateCreated': {
                        $scope.caretShow = !$scope.caretShow;
                        $scope.sortType = 'DateCreated';
                        $scope.sortReverse = !$scope.sortReverse;
                        break;
                    }
                    default:
                }
                filterUsers(a, $scope.sortReverse);
            }
            var filterUsers = function (a, b) {
                if (a == 'Name')
                    a = 'Firstname';
                if (a == 'Status')
                    a = 'isDisabled';
                $scope.userManagementUsers = $filter('orderBy')(userManagementFiltered, a, b);

            };

            $scope.viewby = 15;
            $scope.currentPage = 1;
            $scope.itemsPerPage = $scope.viewby;
            $scope.maxSize = 10;

            $scope.openModal = function (fileName, size, userDetails, modalNumber, modifiedClass) {
                if (modalNumber == 0) {
                    var details = {
                        createEditModalHeader: "Create User Profile",
                        isShowCreate: true,
                        isShowEdit: false,
                        saveOrCreate: 'Create',
                        showPassword: true,
                        userDetails,
                        showEdit: true,
                        userRole: userDetails.role,
                        roleOptions: roleOptions
                    }
                }
                else if (modalNumber == 1) {
                    var details = {
                        createEditModalHeader: "Edit User Profile",
                        isShowCreate: false,
                        isShowEdit: true,
                        saveOrCreate: 'Save',
                        showPassword: false,
                        userDetails,
                        showEdit: false,
                        roleOptions: roleOptions
                    }
                }
                else {
                    var details = {
                        userDetails
                    }
                }

                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/Usermanagement/Modal/' + fileName + '.html',
                    windowClass: modifiedClass,
                    controller: fileName + 'Controller',
                    size: size,
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        items: function () {
                            return details;
                        }
                    },
                });
                modal.result.then(function (result) {
                }, function () {
                    $scope.loadMainTable();
                    //$route.reload();
                });
            };
            $scope.delete = function (userDetails, type) {
                var details = {
                    userDetails,
                    type,
                    message: "Are you sure you want to delete the user profile?",
                    warnMessage: "Clicking 'Yes' will delete all records associated to the user profile.",
                    title: "Delete User Profile"
                };

                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/Usermanagement/Modal/alertModal.html',
                    controller: 'alertModalController',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        items: function () {
                            return details;
                        }
                    },
                });
                modal.result.then(function (result) {
                }, function () {
                    $scope.loadMainTable();//$route.reload();
                });
            }
            $scope.disable = function (userDetails, type) {
                if (type == 'disable') {
                    var details = {
                        userDetails,
                        type,
                        message: "Are you sure you want to disable the user profile?",
                        title: "Disable User Profile"
                    };
                }
                else {
                    var details = {
                        userDetails,
                        type,
                        message: "Are you sure you want to enable the user profile?",
                        title: "Enable User Profile"
                    };
                }


                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/Usermanagement/Modal/alertModal.html',
                    controller: 'alertModalController',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        items: function () {
                            return details;
                        }
                    },
                });
                modal.result.then(function (result) {
                }, function () {
                    $scope.loadMainTable();//$route.reload();
                });
            }
            $scope.formatDate = 'MM/dd/yyyy';
            $scope.datePicker = {
                startDateStatus: { opened: false },
                startDateOpen: function ($event) {
                    $scope.datePicker.startDateStatus.opened = true;
                },
                startsubmittedDateStatus: { opened: false },
                startSubmittedDateOpen: function ($event) {
                    $scope.datePicker.startsubmittedDateStatus.opened = true;
                },
                startDateOptions: {
                    maxDate: null
                },
                startSubmittedDateOptions: {
                    minDate: null,
                    maxDate: new Date()
                },
                endDateStatus: { opened: false },
                endStatusOpen: function ($event) {
                    $scope.datePicker.endDateStatus.opened = true;
                },
                endSubmittedDateStatus: { opened: false },
                endSubmittedStatusOpen: function ($event) {
                    $scope.datePicker.endSubmittedDateStatus.opened = true;
                },
                endDateOptions: {
                    minDate: null
                },
                endSubmittedDateOptions: {
                    minDate: null,
                    maxDate: new Date()
                }
            };

            $scope.changeSubmittedMinAndMaxDate = function () {
                $scope.datePicker.startSubmittedDateOptions.maxDate = $scope.searchModel.endSubmittedDate;
                $scope.datePicker.endSubmittedDateOptions.minDate = $scope.searchModel.startSubmittedDate;

                $scope.end = new Date(moment.utc($scope.datePicker.startSubmittedDateOptions.maxDate));
                $scope.start = new Date(moment.utc($scope.datePicker.endSubmittedDateOptions.minDate));

                var users = userManagementFiltered;

                if ($scope.datePicker.startSubmittedDateOptions.maxDate && $scope.datePicker.endSubmittedDateOptions.minDate)
                {
                    $scope.userManagementUsers = [];
                    angular.forEach(users, function (value, key) {
                        var receivedDate = value.DateCreated;

                        if (new Date(receivedDate) >= $scope.datePicker.endSubmittedDateOptions.minDate && new Date(receivedDate) <= $scope.datePicker.startSubmittedDateOptions.maxDate) {
                            $scope.userManagementUsers.push(value);
                        }
                    }); 
                    
                }
            };

            $scope.showPanelSearch = function () {
                if ($scope.showPanel) {
                    $scope.showPanel = false;
                    $scope.showPanelTitle = "SHOW";
                    $scope.hideShowClass = "outer-box";
                } else {
                    $scope.showPanel = true;
                    $scope.showPanelTitle = "HIDE";
                    $scope.hideShowClass = "outer-box2";
                }
            };
            
            $scope.search = function (name, email, role, status, createdBy, start, end) {
               
                if (status == undefined)
                    status = undefined;

                $scope.searchMsg = "";

                $scope.isLoading = true;                
            }

            $scope.clear = function (searchfrm, srch) {
                angular.copy({}, searchfrm);
                angular.copy({}, srch);
                $scope.searchMsg = "";
                $scope.userManagementUsers = userManagementFiltered;
                //$scope.loadMainTable();
            }
        })
        .filter('dateRange', function () {
            return function (items, fromDate, toDate) {
                var filtered = [];
                console.log(fromDate, toDate);
                var from_date = Date.parse(fromDate);
                var to_date = Date.parse(toDate);
                angular.forEach(items, function (item) {
                    if (Date.parse(item.DateCreated) >= from_date && Date.parse(item.DateCreated) <= to_date) {
                        filtered.push(item);
                    }
                });
                return filtered;
            };
        });
})();