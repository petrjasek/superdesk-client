define([
    'angular',
    'require',
    './workspace-controller',
    './workspace-service',
    './sd-widget-directive',
    './widgets-provider',
    './grid/grid',
    './world-clock/world-clock'
], function(angular, require) {
    'use strict';

    DeskDropdownDirective.$inject = ['desks', '$route'];
    function DeskDropdownDirective(desks, $route) {
        return {
            templateUrl: 'scripts/superdesk-dashboard/views/desk-dropdown.html',
            link: function(scope) {

                scope.select = function selectDesk(desk) {
                    desks.setCurrentDesk(desk);
                    scope.selected = desk;
                    $route.reload();
                };

                desks.fetchCurrentUserDesks()
                    .then(function(userDesks) {
                        scope.desks = userDesks;
                        scope.selected = _.find(userDesks, {_id: desks.getCurrentDeskId()});
                    });
            }
        };
    }

    // to avoid circular dependency
    angular.module('superdesk.dashboard.widgets', []).
        provider('widgets', require('./widgets-provider'));

    return angular.module('superdesk.dashboard', [
        'superdesk.activity',
        'superdesk.dashboard.widgets',
        'superdesk.dashboard.grid',
        'superdesk.dashboard.world-clock',
        'superdesk.workspace.content',
        'superdesk.workspace.tasks'
    ])

    .service('workspace', require('./workspace-service'))
    .directive('sdWidget', require('./sd-widget-directive'))
    .directive('sdDeskDropdown', DeskDropdownDirective)

    .filter('wcodeFilter', function() {
        return function(input, values) {
            return _.pick(input, _.difference(_.keys(input), _.keys(values)));
        };
    })

    .config(['superdeskProvider', function(superdesk) {
        superdesk.activity('/workspace', {
            label: gettext('Workspace'),
            controller: require('./workspace-controller'),
            templateUrl: require.toUrl('./views/workspace.html'),
            topTemplateUrl: require.toUrl('./views/workspace-topnav.html'),
            priority: -1000,
            category: superdesk.MENU_MAIN
        });
    }]);
});
