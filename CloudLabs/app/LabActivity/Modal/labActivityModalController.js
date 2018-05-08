(function (angular) {
    'use strict';
    angular.module('app-labactivity')
        .controller('labActivityModalController', function ($scope, $uibModalInstance, $http, $uibModal, svc, data, $window, $sce) {
            $window.addEventListener("dragover", function (e) {
                e = e || event;
                e.preventDefault();
            }, false);
            $window.addEventListener("drop", function (e) {
                e = e || event;
                e.preventDefault();
            }, false);
            var id = data.LabActivityID();
            $scope.status = data.status();
            $scope.activityName = data.Name();
            $scope.tinymceModel = data.TasksHtml();
            $scope.tinymceOptions = {
                plugins: 'link image code imagetools lists advlist table paste nonbreaking',
                advlist_bullet_styles: 'circle,disc,square',
                height: 230,
                object_resizing: false,
                force_p_newlines: false,
                force_br_newlines: true,
                resize: false,
                force_br_newlines: true,
                force_p_newlines: false,
                forced_root_block: '',
                height: '500px',
                convert_newlines_to_brs: false,
                remove_linebreaks: true,
                nonbreaking_force_tab: true,
                toolbar: 'undo redo | formatselect bold italic fontsizeselect | alignjustify alignleft aligncenter alignright  | bullist numlist | code image | indent outdent',
                content_style: 'img{max-width:50%;max-height:300vh;}',
                imagetools_toolbar: "rotateleft rotateright | flipv fliph | imageoptions",
                file_picker_callback: function (cb, value, meta) {
                    var input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/png');
                    if (meta.filetype == 'image') {

                        input.onchange = function () {
                            var file = this.files[0];
                            var fileExtension = file.name.replace(/^.*\./, '');
                            if (fileExtension == 'png' || fileExtension == 'PNG') {
                                if (file.size < 3000000) {

                                    var reader = new FileReader();
                                    reader.readAsDataURL(file);
                                    reader.onload = function () {

                                        var id = 'blobid' + (new Date()).getTime();
                                        var blobCache = tinymce.activeEditor.editorUpload.blobCache;
                                        var base64 = reader.result.split(',')[1];
                                        var blobInfo = blobCache.create(id, file, base64);
                                        blobCache.add(blobInfo);
                                        cb(blobInfo.blobUri(), { title: file.name });

                                    };
                                }
                                else {  
                                    
                                    $("#mce-modal-block").removeAttr('style');
                                    $('#mce-modal-block').css('display', 'none');
                                    $(".mce-container.mce-panel.mce-floatpanel.mce-window.mce-in").css({ "opacity": "0" });
                                    $(".mce-container.mce-panel.mce-floatpanel.mce-window.mce-in").css({ "z-index": "0" });
                                    $(".mce-reset.mce-fade.mce-in").css({"z-index":"0"});
                                    $(".mce-widget.mce-tooltip.mce-tooltip-n").css({"z-index":"0"});
                                    (function (angular) {
                                        var modal = $uibModal.open({
                                            animation: true,
                                            templateUrl: '/app/LabActivity/Modal/confirmationModal.html',
                                            controller: 'confirmationModalController',
                                            controllerAs: '$confmodal',
                                            size: 'sm',
                                            backdrop: 'static',
                                            keyboard: false,
                                            resolve: {
                                                items: function () {
                                                    return {

                                                        message: function () {
                                                            return "File is too large!";
                                                        },
                                                        title: function () {
                                                            return "Error";
                                                        },
                                                        labActivity: function () {
                                                            return "";
                                                        },
                                                        labActID: function () {
                                                            return "";
                                                        },
                                                        status: function () {
                                                            return "size";
                                                        }
                                                    };
                                                }


                                            }
                                        });
                                    }(window.angular));
                                }
                               
                            }
                        };
                    }
                    input.click();
                },
                
                automatic_uploads: false,
                image_dimensions: false,
                images_upload_url: apiUrl + 'LabActivities/UploadThumbnail',
                image_dimensions: false,
                image_class_list: [
                    { title: 'Responsive', value: 'img-responsive' }
                ]

                
                
            };
          
         

            (function (angular) {


                $scope.getContent = function (name, task) {
                   

                    $scope.index = 0;


                    var newstr = $scope.tinymceModel.replace(/<[a-zA-Z0-9/]*>/g, "");
                   
                    
                    var labActValue = {
                        LabActivityID: id,
                        Name: name,
                        Tasks: newstr,
                        TasksHtml: $scope.tinymceModel

                    };

                    if ($scope.status === 'create') {
                        var modal = $uibModal.open({
                            animation: true,
                            templateUrl: '/app/LabActivity/Modal/confirmationModal.html',
                            controller: 'confirmationModalController',
                            controllerAs: '$confmodal',
                            size: 'md',
                            backdrop: 'static',
                            keyboard: false,
                            resolve: {
                                items: function () {
                                    return {

                                        message: function () {
                                            return "Do you wish to create the lab activity?";
                                        },
                                        title: function () {
                                            return "Create Lab Activity";
                                        },
                                        labActivity: function () {
                                            return labActValue;
                                        },
                                        labActID: function () {
                                            return id;
                                        },
                                        status: function () {
                                            return "create";
                                        }
                                    };
                                }


                            }
                        });
                    }
                    else if ($scope.status === 'edit') {
                        modal = $uibModal.open({
                            animation: true,
                            templateUrl: '/app/LabActivity/Modal/confirmationModal.html',
                            controller: 'confirmationModalController',
                            controllerAs: '$confmodal',
                            size: 'md',
                            backdrop: 'static',
                            keyboard: false,
                            resolve: {
                                items: function () {
                                    return {

                                        message: function () {
                                            return "Do you wish to save changes?";
                                        },
                                        title: function () {
                                            return "Edit Lab Activity";
                                        },
                                        labActivity: function () {
                                            return labActValue;
                                        },
                                        labActID: function () {
                                            return id;
                                        },
                                        status: function () {
                                            return "edit";
                                        }
                                    };
                                }


                            }
                        });
                    }
                };
                $scope.close = function () {
                    $("html").removeAttr('style');

                    $uibModalInstance.close();
                    $scope.index = 0;

                };
                $scope.cancel = function () {
                    $("html").removeAttr('style');
                    $scope.status = true;
                    $uibModalInstance.close();
                    $scope.index = 0;

                };


            }(window.angular));

        });
})(window.angular);