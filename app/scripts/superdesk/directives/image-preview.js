define(['angular', 'bower_components/jcrop/js/jquery.Jcrop'], function(angular) {
    'use strict';

    var URL = window.URL || window.webkitURL;

    var module = angular.module('superdesk');

    module.directive('sdImagePreview', function() {
        return {
            scope: {
                sdImagePreview: '='
            },
            link: function(scope, elem, attrs) {
                elem.change(function(e) {
                    if (e.target.files.length) {
                        var file = e.target.files[0],
                            fileReader = new FileReader();

                        fileReader.onload = function(e) {
                            scope.$apply(function() {
                                scope.sdImagePreview = e.target.result;
                            });
                        };

                        fileReader.readAsDataURL(file);
                    }
                });
            }
        };
    });

    module.directive('sdVideoCapture', function() {
        return {
            scope: {
                sdVideoCapture: '='
            },
            link: function(scope, elem) {
                var localMediaStream = null,
                    canvas = angular.element('<canvas style="display:none"></canvas>'),
                    ctx = canvas[0].getContext('2d');

                elem.after(canvas);

                navigator.webkitGetUserMedia({
                    video: {
                        mandatory: {
                            minWidth: 500,
                            minHeight: 500
                        }
                    }
                }, function(stream) {
                    elem.attr('src', URL.createObjectURL(stream));
                    localMediaStream = stream;
                });

                elem.click(function(e) {
                    var img = elem[0];
                    canvas[0].width = img.videoWidth;
                    canvas[0].height = img.videoHeight;
                    ctx.drawImage(img, 0, 0);
                    scope.$apply(function() {
                        scope.sdVideoCapture = canvas[0].toDataURL('image/webp');
                    });
                });

                scope.$on('$destroy', function() {
                    try {
                        elem[0].pause();
                        localMediaStream.stop();
                    } catch (err) {}
                });
            }
        };
    });

    module.directive('sdCrop', function() {
        return {
            scope: {
                src: '=',
                cords: '=',
                width: '@',
                height: '@'
            },
            link: function(scope, elem) {
                scope.$watch('src', function(src) {
                    elem.empty();

                    if (src) {
                        var img = new Image();
                        img.onload = function () {
                            $(this).Jcrop({
                                aspectRatio: 1.0,
                                minSize: [200, 200],
                                trueSize: [this.width, this.height],
                                setSelect: [0, 0, 200, 200],
                                onChange: function(c) {
                                    scope.$apply(function() {
                                        scope.cords = c;
                                    });
                                }
                            });
                        };
                        $(img).css('max-width', '450px');
                        $(img).css('max-height', '450px');
                        elem.append(img);
                        img.src = src;
                    }
                });
            }
        };
    });
});
