
var token = "";
(function () {
    var app = angular.module("main-app", ["ngFileUpload", "ngCookies","infinite-scroll"]);
    
    app.run(function ($http, $cookies) {
        var tok = $cookies.get('CloudSwyftToken');
        $http.defaults.headers.common.Authorization = 'Bearer ' + tok;
        token = tok;
    });

    app.service("svc", function ($http, Upload, $timeout, $q, $filter) {
        var service = this;

        this.getEmailAddressExist = function (email) {
            return $http.get(apiUrl + "/UserManagement//GetEmailAddressExist?email=" + encodeURIComponent(email)).then(
                function (response) { return response.data; });
        };

        this.gotoRegister = function (userModel) {
            return $http.post(authUrl + "/api/Account/Register", userModel,
                {
                    headers: { 'Content-Type': 'application/json' }
                });
        };

        this.getCoursesByUserId = function (userId) {
            return $http.get(apiUrl + "/Course/GetCoursesByUserId?userId=" + userId).then(
                function (response) { return response.data; });
        };

        this.GetProvisionedVeprofilesByUser = function (userId) {
            return $http.get(apiUrl + "/VEProfiles/GetProvisionedVeprofilesByUser?userId=" + userId).then(
                function (response) { return response.data; });
        };

        this.getMe = function () {
            return $http({
                method: 'GET',
                url: authUrl + "/api/account/me",
                //data: user,
                headers: { 'Authorization': 'Bearer ' + token }
            });
        };

        //this.getMe = function () {
        //    //$http.defaults.headers.common.Authorization = 'Bearer ' + token;
        //    //return $http.get(authUrl + "/api/account/me").then(function (response) {
        //    //    return response.data;
        //    //});
        //    return $http.get(authUrl + "/api/account/me", {
        //        headers: {
        //            "Authorization": 'Bearer ' + token
        //        }
        //    }).then(function (reesponse) {
        //        return response.data;
        //    })
        //};
        

        this.getProvisionedDetails = function (userId, veprofileId) {
            return $http.get(apiUrl + "/Virtualmachines/ByVeProfileUser?userID=" + userId + "&veProfileId=" + veprofileId).then(
                function (response) {
                    return response.data;
                });
        };
      
        this.GetActivityLabList = function (pageSize, pageNum, labacts) {
            return $http.get(apiUrl + "/LabActivities?q=&pageSize=" + pageSize + "&activePage=" + pageNum + "&labacts=" + labacts).then(
                function (response) { return response.data; });
        };

        this.postLabActivity = function (labActs) {
            return $http.post(apiUrl + "/LabActivities/CreateLabActivities", labActs, {
                headers: { 'Content-Type': 'application/json' }
            }).then(function (response) { return response.data; });
        };
        this.deleteLabActivities = function (id) {
            return $http.delete(apiUrl + "LabActivities/DeleteLabActivities?id=" + id).then(
                function (response) { return response.data; });
        };        

        this.getLabProfiles = function (pageSize, pageNum, courseId) {
            return $http.get(apiUrl + "/VEProfiles?q=&pageSize=" + pageSize + "&activePage=" + pageNum + "&courseId=" + courseId).then(
                function (response) { return response.data; });
        };

        this.getVETemplates = function (Id) {
            return $http.get(apiUrl + "/VirtualEnvironments/ByVEType?veTypeID=" + Id)
                .then(function (response) { return response.data });
        };

        this.getVETypes = function (data, veTitle, veTemplateId) {
            return $http.get(apiUrl + "/VETypes")
                .then(function (response) { return response.data });
        };

        this.getLabActivities = function () {
            return $http.get(apiUrl + "/LabActivities")
                .then(function (response) { return response.data });
        };

        this.getProfileActivities = function (labProfileId) {
            return $http.get(apiUrl + "/LabActivities/ByVEProfile?veProfileID=" + labProfileId)
                .then(function (response) { return response.data });
        };

        this.searchLabProfiles = function (entry, pageSize) {
            return $http.get(apiUrl + "/VEProfiles?q=" + entry + "&pageSize=" + pageSize).then(
                function (response) { return response.data; });
        };
    
        this.createLabProfile = function (profileDetails, type) {
            return $http.post(apiUrl + "/VEProfiles/CreateLabProfile?Type="+ type, profileDetails,
                {
                    headers: { 'Content-Type': 'application/json' }
                } )
                .then(function (response) { return response.data; });
        };

        this.bindLabActivities = function (addLabActivity) {
            return $http.post(apiUrl + "/VEProfiles/AddLabActivities", addLabActivity, )
                .then(function (response) { return response.data });
        };

        this.updateLabActivities = function (addLabActivity) {
            return $http.put(apiUrl + "/VEProfiles/UpdateLabActivities", addLabActivity, )
                .then(function (response) { return response.data });
        };

        this.deleteLabProfile = function (modalData) {
            return $http.delete(apiUrl + "/VEProfiles/DeleteLabProfile?VEProfileID=" + modalData.VEProfileID)                
                .then(function (response) { return response.data; });
        };
        
        this.uploadImage = function (image) {
            return Upload.upload({
                url: apiUrl + '/File',
                data: { file: image },
            }).then(function (response) {
                return response.data;
            });
        };

        this.getLabProfileById = function (labProfileId) {
            return $http.get(apiUrl + "/VEProfiles/GetProfile?VEProfileID=" + labProfileId)
                .then(function (response) {return response.data;});
        };

        this.toggleVM = function (veProfileId, userID, started) {
            return $http.get(apiUrl + "/VirtualMachines/ToggleVM?userID=" + veProfileId + "&veProfileId=" + userID + "&started=" + started)
                .then(function (response) { return response.data;});
        };

        this.startVM = function (userID, veProfileId) {
            return $http.get(apiUrl + "/VirtualMachines/StartVM?userID=" + userID + "&veProfileId=" + veProfileId)
                .then(function (response) { return response.data;});
        };

        this.roleCloudOptions = function (role) {
            return $http.get(apiUrl + "/UserManagement/GetUserRoleCloudLabs?role=" + role)
                .then(
                function mySuccess(response) {
                    return response.data;
                });
        };

        this.GetUsersCloudLabs = function (id, role) {
            return $http.get(apiUrl + "/UserManagement/GetUsersCloudLabs?id=" + id + "&role=" + role).then(
                function (response) {
                    return response.data;
                });
        }

        this.createUser = function (user) {
            return $http.post(authUrl + "/api/Account/create?model=", user,
                {
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(
                function (response) { return response.data; });
        };

        this.editUser = function (user) {
            return $http.post(authUrl + "/api/Account/EditProfile?editModel=", user,
                {
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(
                function (response) { return response.data; });
        };

        this.disableUser = function (id, isDisable) {
            return $http.delete(authUrl + "/api/Account/Disable?userId=" + id + "&isDisable=" + isDisable).then(
                function (response) { return response.data; });
        };

        this.deleteUser = function (id) {
            return $http.delete(authUrl + "/api/Account/Delete?userId=" + id).then(
                function (response) { return response.data; });
        };


    });


})();