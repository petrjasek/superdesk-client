define([
    'angular',
    './translate',
    './upload',
    './notify',
    './settings',
    './storage',
    '../userSettings',
    '../entity',
    '../server'
], function(angular) {
    'use strict';

    angular.module('superdesk.services', [
        'superdesk.services.translate',
        'superdesk.services.upload',
        'superdesk.services.notify',
        'superdesk.services.settings',
        'superdesk.services.storage',
        'superdesk.userSettings',
        'superdesk.entity',
        'superdesk.server'
    ]);
});