(function () {

    "use strict";
    angular.module("app-Usermanagement")
        .controller("createUserController", function ($scope, items, $uibModalInstance, $uibModal, $http, svc) {

            $scope.createEditModalHeader = items.createEditModalHeader;
            $scope.showEdit = items.showEdit;
            $scope.isShowCreate = items.isShowCreate;
            $scope.isShowEdit = items.isShowEdit;
            $scope.saveOrCreate = items.saveOrCreate;
            $scope.showPassword = items.showPassword;
            $scope.showOrHidePass = 'password';
            $scope.showOrHideConfirmPass = 'password';
            $scope.emailPattern = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            $scope.passPattern = /^(([\d\w\W])*)$/;
            const r = items.userDetails.Role;
            $scope.id = items.userDetails.Id;
            $scope.firstname = items.userDetails.Firstname;
            $scope.lastname = items.userDetails.Lastname;
            $scope.email1 = items.userDetails.Email;
            $scope.role = items.userDetails.Role;
            $scope.roles = items.roleOptions;
            $scope.onChangePic = function () {
                return "../../Content/images/profile.jpg";
            };

            $scope.glyph = false;
            $scope.glyphPass = false;

            $scope.showPass = function () {
                if ($scope.showOrHidePass == 'password') {
                    $scope.showOrHidePass = 'text';
                    $scope.glyphPass = true;
                }
                else {
                    $scope.showOrHidePass = 'password';
                    $scope.glyphPass = false;
                }
            };

            $scope.showConfirmPass = function () {
                if ($scope.showOrHideConfirmPass == 'password') {
                    $scope.glyph = true;
                    $scope.showOrHideConfirmPass = 'text';
                }
                else {
                    $scope.showOrHideConfirmPass = 'password';
                    $scope.glyph = false;
                }
            };

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.submit = function (email, role, firstname, lastname, password, passwordCompare, type, id) {
                var user = {
                    FirstName: firstname,
                    LastName: lastname,
                    Email: email,
                    Password: password,
                    ConfirmPassword: passwordCompare,
                    Roles: role,
                    id: id
                };

                $scope.alertModal(type, user);

            }

            $scope.alertModal = function (type, user) {
                switch (type) {
                    case 'Alert':
                        var details = {
                            message: user.email + " already exist. Please use a different email.",
                            title: type,
                            user: user
                        };
                        break;
                    case 'Create':
                        var details = {
                            message: "User profile was created successfully.",
                            title: 'Information',
                            type: type,
                            user: user
                        };
                        break;
                    case 'Edit':

                        var details = {
                            message: "User profile has been sucessfully updated.",
                            title: 'Information',
                            type: type,
                            user: user,
                            role: r
                        };
                        break;
                    case 'Add another':
                        var vm = this;
                        var details = {
                            message: "User profile was created successfully.",
                            title: 'Information',
                            type: type,
                            user: user
                        };
                        vm.myForm.$setPristine();
                        vm.myForm.$setUntouched();
                        $scope.firstname = "";
                        $scope.lastname = "";
                        $scope.email = "";
                        $scope.role = "";
                        $scope.password = "";
                        $scope.confirmPassword = "";
                        break;
                    case 'Reactivate User':
                        var details = {
                            message: "User is currently deactivated. Do you want to reactivate and continue on user creation " + user.email,
                            title: type,
                            user: user
                        };
                        break;
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
                    if (result) {
                        $uibModalInstance.close();
                    }

                }, function () {
                });
            };

            $scope.ifEmailExist = function (id, email) {
                $scope.isExist = false;

                svc.getEmailAddressExist(email).then(
                    function (response) {
                        if (response == true)
                            $scope.isExist = false;
                        else
                            $scope.isExist = true;

                    })

            }
        })
        .directive('unique', function ($q, $timeout, svc) {
            return {
                require: 'ngModel',
                link: function (scope, elm, attrs, ctrl) {

                    ctrl.$asyncValidators.unique = function (modelValue, viewValue) {

                        if (ctrl.$isEmpty(modelValue)) {
                            return $q.resolve();
                        }

                        var def = $q.defer();

                        svc.getEmailAddressExist(modelValue).then(
                            function (response) {
                                if (response == true)
                                    def.reject();
                                else
                                    def.resolve();
                            })

                        return def.promise;
                    };
                }
            };
        })
        .directive('pwCheck', function () {
            return {
                require: 'ngModel',
                link: function (scope, elem, attrs, ctrl) {
                    var firstPassword = '#' + attrs.pwCheck;
                    elem.add(firstPassword).on('keyup', function () {
                        scope.$apply(function () {

                            ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                            if (elem.val() === $(firstPassword).val())
                                return true;
                            else
                                return false;
                        })
                    });
                }
            }

        });

})();