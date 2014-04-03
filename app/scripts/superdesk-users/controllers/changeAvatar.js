define([], function() {
    'use strict';

    ChangeAvatarController.$inject = ['$scope', '$upload'];
    function ChangeAvatarController($scope, $upload) {

        $scope.method = 'computer';
        $scope.preview = {url: null};

        $scope.setMethod = function(method) {
            $scope.method = method;
            $scope.preview.url = null;
        };

        $scope.upload = function(config) {
            console.log('upload', config);
            return $scope.resolve(config);
        };
    }

    return ChangeAvatarController;
});
