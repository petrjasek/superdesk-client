define([
    'angular',
    'require',
    './autoheight-directive'
], function(angular, require) {
    'use strict';

    /**
     * Gives toggle functionality to the box
     *
     * Usage:
     * <div sd-toggle-box data-title="Some title" data-open="true" data-icon="list"></div>
     *
     */
    function ToggleBoxDirective() {
    	return {
            templateUrl: 'scripts/superdesk/ui/views/toggle-box.html',
            transclude: true,
            scope: true,
            link: function($scope, element, attrs) {
                $scope.title = attrs.title;
                $scope.isOpen = attrs.open === 'true';
                $scope.icon = attrs.icon;
                $scope.toggleModule = function() {
                    $scope.isOpen = !$scope.isOpen;
                };
            }
        };
    }

    /**
     * Gives top shadow for scroll elements
     *
     * Usage:
     * <div sd-shadow></div>
     */
    ShadowDirective.$inject = ['$timeout'];
    function ShadowDirective($timeout) {
        return {
            link: function(scope, element, attrs) {

                element.addClass('shadow-list-holder');

                function shadowTimeout() {
                    var shadow = angular.element('<div class="scroll-shadow"><div class="inner"></div></div>');
                    element.parent().prepend(shadow);
                    element.on('scroll', function scroll() {
                        if ($(this).scrollTop() > 0) {
                            shadow.addClass('shadow');
                        } else {
                            shadow.removeClass('shadow');
                        }
                    });
                }

                scope.$on('$destroy', function() {
                    element.off('scroll');
                });

                $timeout(shadowTimeout, 1, false);
            }
        };
    }

    /**
     * Convert newline charachter from text into given html element (default <br/>)
     *
     * Usage:
     * <div data-html="text | nl2el"></div>
     * or
     * <div data-html="text | nl2el:'</p><p>'"></div> for specific replace element
     */
    function NewlineToElement() {
        return function(input, el) {
            return input.replace(/(?:\r\n|\r|\n)/g, el || '<br/>');
        };
    }

    /**
     * Handle all wizards used in UI
     *
     */
    WizardHandlerFactory.$inject = [];
    function WizardHandlerFactory() {

        var service = {};
        var wizards = {};

        service.defaultName = 'defaultWizard';

        service.addWizard = function(name, wizard) {
            wizards[name] = wizard;
        };

        service.removeWizard = function(name) {
            delete wizards[name];
        };

        service.wizard = function(name) {
            var nameToUse = name || service.defaultName;
            return wizards[nameToUse];
        };

        return service;
    }

    WizardDirective.$inject = [];
    function WizardDirective() {
        return {
            templateUrl: 'scripts/superdesk/ui/views/wizard.html',
            scope: {
                currentStep: '=',
                finish: '&',
                name: '@'
            },
            transclude: true,
            controller: ['$scope', '$element', 'WizardHandler', function($scope, element, WizardHandler) {

                WizardHandler.addWizard($scope.name || WizardHandler.defaultName, this);
                $scope.$on('$destroy', function() {
                    WizardHandler.removeWizard($scope.name || WizardHandler.defaultName);
                });

                $scope.selectedStep = null;
                $scope.steps = [];

                this.addStep = function(step) {
                    $scope.steps.push(step);
                };

                $scope.$watch('currentStep', function(stepCode) {
                    if (stepCode && (($scope.selectedStep && $scope.selectedStep.code !== stepCode) || !$scope.selectedStep)) {
                        $scope.goTo(_.findWhere($scope.steps, {code: stepCode}));
                    }
                });

                function unselectAll() {
                    _.each($scope.steps, function (step) {
                        step.selected = false;
                    });
                    $scope.selectedStep = null;
                }

                $scope.goTo = function(step) {
                    unselectAll();
                    $scope.selectedStep = step;
                    if (!_.isUndefined($scope.currentStep)) {
                        $scope.currentStep = step.code;
                    }
                    step.selected = true;
                };

                this.goTo = function(step) {
                    var stepTo;
                    if (_.isNumber(step)) {
                        stepTo = $scope.steps[step];
                    } else {
                        stepTo = _.findWhere($scope.steps, {code: step});
                    }
                    $scope.goTo(stepTo);
                };

                this.next = function() {
                    var index = _.indexOf($scope.steps , $scope.selectedStep);
                    if (index === $scope.steps.length - 1) {
                        this.finish();
                    } else {
                        $scope.goTo($scope.steps[index + 1]);
                    }
                };

                this.previous = function() {
                    var index = _.indexOf($scope.steps , $scope.selectedStep);
                    $scope.goTo($scope.steps[index - 1]);
                };

                this.finish = function() {
                    if ($scope.finish) {
                        $scope.finish();
                    }
                };
            }]
        };
    }

    WizardStepDirective.$inject = [];
    function WizardStepDirective() {
        return {
            templateUrl: 'scripts/superdesk/ui/views/wizardStep.html',
            scope: {
                title: '@',
                code: '@'
            },
            transclude: true,
            require: '^sdWizard',
            link: function($scope, element, attrs, wizard) {
                wizard.addStep($scope);
            }
        };
    }

    CreateButtonDirective.$inject = [];
    function CreateButtonDirective() {
        return {
            restrict: 'C',
            template: '<i class="svg-icon-plus"></i><span class="circle"></span>'
        };
    }

    AutofocusDirective.$inject = [];
    function AutofocusDirective() {
        return {
            link: function(scope, element) {
                _.defer(function() {
                    element.focus();
                });
            }
        };
    }

    AutoexpandDirective.$inject = [];
    function AutoexpandDirective() {
        return {
            link: function(scope, element) {

                var _minHeight = element.outerHeight();

                function resize() {
                    var e = element[0];
                    var vlen = e.value.length;
                    if (vlen !== e.valLength) {
                        if (vlen < e.valLength) {
                            e.style.height = '0px';
                        }
                        var h = Math.max(_minHeight, e.scrollHeight);

                        e.style.overflow = (e.scrollHeight > h ? 'auto' : 'hidden');
                        e.style.height = h + 1 + 'px';

                        e.valLength = vlen;
                    }
                }

                resize();

                element.on('keyup change', function() {
                    resize();
                });

            }
        };
    }

    DatepickerDirective.$inject = [];
    function DatepickerDirective() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                $(function() {
                    element.datepicker({
                        dateFormat:'dd/mm/yy',
                        prevText: '<i class="icon-chevron-left-thin icon-white"></i>',
                        nextText: '<i class="icon-chevron-right-thin icon-white"></i>',
                        onSelect:function (date) {
                            scope.$apply(function () {
                                ngModelCtrl.$setViewValue(date);
                            });
                        }
                    });
                });
            }
        };
    }

    return angular.module('superdesk.ui', [])

        .directive('sdShadow', ShadowDirective)
        .directive('sdAutoHeight', require('./autoheight-directive'))
        .directive('sdToggleBox', ToggleBoxDirective)
        .filter('nl2el', NewlineToElement)
        .factory('WizardHandler', WizardHandlerFactory)
        .directive('sdWizard', WizardDirective)
        .directive('sdWizardStep', WizardStepDirective)
        .directive('sdCreateBtn', CreateButtonDirective)
        .directive('sdAutofocus', AutofocusDirective)
        .directive('sdAutoexpand', AutoexpandDirective)
        .directive('sdDatepicker', DatepickerDirective);
});
