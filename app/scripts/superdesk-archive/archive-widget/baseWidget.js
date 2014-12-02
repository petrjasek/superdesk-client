(function() {
    'use strict';

    angular.module('superdesk.widgets.base', [])
        .factory('BaseWidgetController', ['$location', '$timeout', 'superdesk', 'search', 'preferencesService', 'notify',
        function BaseWidgetControllerFactory($location, $timeout, superdesk, search, preferencesService, notify) {

            var INGEST_EVENT = 'ingest:update';

            return function BaseWidgetController($scope) {
                var config;
                var refresh = _.debounce(_refresh, 1000);
                var pinnedList = {};
                $scope.search = {};

                $scope.selected = null;
                preferencesService.get('pinned:items').then(function(result) {
                    $scope.pinnedItems = result;
                    _.each($scope.pinnedItems, function(item) {
                        pinnedList[item._id] = true;
                    });
                });

                $scope.processedItems = null;

                $scope.$on(INGEST_EVENT, function() {
                    $timeout(refresh);
                });

                $scope.$watchGroup([
                    'widget.configuration.provider',
                    'widget.configuration.maxItems',
                    'search.query || widget.configuration.search',
                    'item'
                ], function(vals) {
                    config = {
                        provider: vals[0],
                        size: parseInt(vals[1], 10),
                        search: vals[2],
                        item: vals[3]
                    };
                    refresh();
                });

                function getSearchCriteria(config) {
                    var query = search.query(config.search || null);
                    query.size(config.size || 10);

                    if (config.provider && config.provider !== 'all') {
                        query.filter({term: {provider: config.provider}});
                    }

                    if (config.item && !config.search) {
                        query.query({
                            more_like_this: {
                                fields: ['slugline', 'headline'],
                                like_text: config.item.headline,
                                ids: [config.item._id],
                                min_term_freq: 1,
                                min_doc_freq: 3
                            }
                        });
                    }

                    return query.getCriteria();
                }

                function processItems() {
                    $scope.processedItems = $scope.pinnedItems.concat($scope.items._items);
                }

                function _refresh() {
                    var criteria = getSearchCriteria(config);
                    $scope.api.query({source: criteria}).then(function(items) {
                        $scope.items = items;
                        processItems();
                    });
                }

                $scope.view = function(item) {
                    $scope.selected = item;
                };

                $scope.go = function(item) {
                    $location.path('/workspace/content');
                    $location.search('_id', item._id);
                };

                $scope.pin = function(item) {
                    var newItem = _.cloneDeep(item);
                    newItem.pinnedInstance = true;
                    $scope.pinnedItems.push(newItem);
                    $scope.pinnedItems = _.uniq($scope.pinnedItems, '_id');
                    pinnedList[item._id] = true;
                    save($scope.pinnedItems);
                };

                $scope.unpin = function(item) {
                    _.remove($scope.pinnedItems, {_id: item._id});
                    pinnedList[item._id] = false;
                    save($scope.pinnedItems);
                };

                $scope.isPinned = function(item) {
                    return item && pinnedList[item._id];
                };

                var save = function(pinnedItems) {
                    var update = {
                        'pinned:items': pinnedItems
                    };

                    preferencesService.update(update, 'pinned:items').then(function() {
                            processItems();
                        }, function(response) {
                            notify.error(gettext('Session preference could not be saved...'));
                    });
                };
            };
        }])
        .factory('BaseWidgetConfigController', [
        function BaseWidgetConfigControllerFactory() {

            return function BaseWidgetConfigController($scope) {
                $scope.fetchProviders = function() {
                    $scope.api.query({source: {size: 0}}).then(function(items) {
                        $scope.availableProviders = ['all'].concat(_.pluck(items._aggregations.originator.buckets, 'key'));
                    });
                };

                $scope.notIn = function(haystack) {
                    return function(needle) {
                        return haystack.indexOf(needle) === -1;
                    };
                };
            };
        }]);
})();
