define([], function() {
    'use strict';

    ChangeAvatarController.$inject = ['$scope', '$upload'];
    function ChangeAvatarController($scope, $upload) {

        $scope.preview = {
            url: ''
        };

        $scope.sources = [
            {
                title: 'Upload from computer',
                active: true
            },
            {
                title: 'Take a snapshot',
                active: false
            },
            {
                title: 'Specify a web URL',
                active: false
            },
            {
                title: 'Use default avatar',
                active: false
            }
        ];

        $scope.activate = function(index) {
            _.forEach($scope.sources, function(s) {
                s.active = false;
            });
            $scope.sources[index].active = true;
            $scope.preview.url = '';
        };

        $scope.upload = function(config) {
            console.log('upload', config);
            return $scope.resolve(config);
        };
    }

    return ChangeAvatarController;
});
