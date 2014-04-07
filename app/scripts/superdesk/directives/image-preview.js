define(['angular', 'lodash', 'bower_components/jcrop/js/jquery.Jcrop'], function(angular, _) {
    'use strict';

    var URL = window.URL || window.webkitURL;

    var module = angular.module('superdesk');

    module.directive('sdImagePreview', function() {
        var IS_IMG_REGEXP = /^image\//;
        return {
            scope: {
                file: '=',
                sdImagePreview: '='
            },
            link: function(scope, elem) {

                function updatePreview(e) {
                    scope.$apply(function() {
                        scope.sdImagePreview = e.target.result;
                    });
                }

                scope.$watch('file', function(file) {
                    if (file && IS_IMG_REGEXP.test(file.type)) {
                        var fileReader = new FileReader();
                        fileReader.onload = updatePreview;
                        fileReader.readAsDataURL(file);
                    } else if (file) {
                        console.error('File type is not supported: ' + file.type);
                    }
                });
            }
        };
    });

    module.directive('sdVideoCapture', function() {

        navigator.getMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

        return {
            scope: {
                sdVideoCapture: '='
            },
            link: function(scope, elem) {
                var localMediaStream = null,
                    canvas = angular.element('<canvas style="display:none"></canvas>'),
                    ctx = canvas[0].getContext('2d'),
                    tooLate = false;

                elem.after(canvas);

                navigator.getMedia({
                    video: true,
                    audio: false
                }, function(stream) {
                    if (tooLate) {
                        stream.stop();
                        return;
                    }

                    localMediaStream = stream;
                    if (navigator.mozGetUserMedia) {
                        elem[0].mozSrcObject = stream;
                    } else {
                        elem[0].src = URL.createObjectURL(stream);
                    }
                }, function(err) {
                    console.error('There was an error when getting media: ' + err);
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
                        tooLate = true;
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

                var bounds, boundx, boundy;

                var updateScope = _.throttle(function(c) {
                    scope.$apply(function() {
                        scope.cords = c;
                        var rx = 120 / scope.cords.w;
                        var ry = 120 / scope.cords.h;
                        showPreview('.preview-target-1', rx, ry, boundx, boundy, scope.cords.x, scope.cords.y);
                        showPreview('.preview-target-2', rx / 2, ry / 2, boundx, boundy, scope.cords.x, scope.cords.y);
                    });
                }, 300);

                function showPreview(e, rx, ry, boundx, boundy, cordx, cordy) {
                    $(e).css({
                        width: Math.round(rx * boundx) + 'px',
                        height: Math.round(ry * boundy) + 'px',
                        marginLeft: '-' + Math.round(rx * cordx) + 'px',
                        marginTop: '-' + Math.round(ry * cordy) + 'px'
                    });
                }

                scope.$watch('src', function(src) {
                    elem.empty();
                    if (src) {
                        var img = new Image();
                        img.onload = function() {

                            $(this).Jcrop({
                                aspectRatio: 1.0,
                                minSize: [200, 200],
                                trueSize: [this.width, this.height],
                                setSelect: [0, 0, 200, 200],
                                onChange: updateScope
                            }, function() {
                                bounds = this.getBounds();
                                boundx = bounds[0];
                                boundy = bounds[1];
                            });
                        };
                        elem.append(img);
                        img.src = src;
                    }
                });
            }
        };
    });
});
