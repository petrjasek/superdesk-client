define([
    'superdesk/services/storage',
    './scratchpad-service'
], function(storageService, ScratchpadService) {
    'use strict';

    beforeEach(module('superdesk.services.preferencesService'));
    beforeEach(module('superdesk.notify'));

    describe('scratchpadService', function() {
        beforeEach(function() {
            module(storageService.name);
            module(function($provide) {
                $provide.service('scratchpad', ScratchpadService);
            });
        });

        var $q, storage, service, testItem, testItem2, preferencesService;

        beforeEach(module(function($provide) {
            $provide.service('api', function($q) {
                return {
                    archive: {
                        getByUrl: function() {
                            return $q.when(testItem);
                        },
                        getHeaders: function() {
                            return {};
                        }
                    }
                };
            });
        }));

        beforeEach(inject(function($injector, notify) {
            $q = $injector.get('$q');
            storage = $injector.get('storage');
            preferencesService = $injector.get('preferencesService');
            service = $injector.get('scratchpad');
            testItem = {
                _links: {self: {href: 'test'}},
                data: 1
            };
            testItem2 = {
                _links: {self: {href: 'test2'}},
                data: 2
            };
            storage.clear();
            service.itemList = [];
            service.data = {};
            spyOn(preferencesService, 'update').andReturn($q.when({}));
        }));

        it('can add items', function() {
            service.addItem(testItem);

            var update = { 
                "scratchpad:items" : service.itemList
            };

            expect(preferencesService.update).toHaveBeenCalledWith(update, "scratchpad:items");
        });

        it('can remove items', function() {
            service.addItem(testItem);
            service.removeItem(testItem);

            var update = { 
                "scratchpad:items" : []
            };

            expect(preferencesService.update).toHaveBeenCalledWith(update, "scratchpad:items");
            expect(service.itemList).toEqual([]);
        });

        it('can check if item exists and return false', function() {
            var test = service.checkItemExists(testItem);
            expect(test).toEqual(false);
        });

        it('can check if item exists and return true', function() {
            service.addItem(testItem);
            var test = service.checkItemExists(testItem);
            expect(test).toEqual(true);
        });

        it('can sort items', function() {
            service.addItem(testItem);
            service.addItem(testItem2);
            service.sort([1, 0]);

            var update = { 
                "scratchpad:items" : service.itemList
            };

            expect(preferencesService.update).toHaveBeenCalledWith(update, "scratchpad:items");
            expect(service.itemList).toEqual(['test2', 'test']);
        });

        it('can get items', inject(function($rootScope) {
            var test = null;

            service.addItem(testItem);
            service.data = {};

            service.getItems().then(function(response) {
                test = response[0];
            });

            $rootScope.$apply();

            expect(test.data).toEqual(testItem.data);
        }));

        it('can announce to listeners', inject(function($rootScope) {
            var test = false;

            service.addListener(function() {
                test = true;
            });

            expect(test).toEqual(false);

            service.addItem(testItem);
            $rootScope.$digest();

            expect(test).toEqual(true);
        }));
    });
});
