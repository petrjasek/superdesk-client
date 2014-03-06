define(['lodash', 'angular'], function(_, angular) {
    'use strict';

    return ['$scope', '$q', 'upload', 'locationParams', 'em', 'notify', 'gettext',
    function ($scope, $q, upload, locationParams, em, notify, gettext) {

        $scope.editPicture = function() {
            upload.upload('users').then(function(data) {
                $scope.user.picture_url = data.url;
                em.update($scope.user, {picture_url: $scope.user.picture_url});
            });
        };

        $scope.save = function() {
            if ('password' in $scope.user && !$scope.user.password) {
                // prevent empty password save
                delete $scope.user.password;
            }

            notify.info(gettext('Saving..'));
            if ($scope.user._id !== undefined) {
                em.update($scope.user).then(function() {
                    notify.pop();
                    notify.success(gettext('User saved.'), 3000);
                });
            } else {
                em.create('users', $scope.user).then(function(user) {
                    locationParams.path('/users/' + user._id);
                    notify.pop();
                    notify.success(gettext('User created.'), 3000);
                });
            }
        };

        //password change
        $scope.passwordEqual = true;
        $scope.passwordValid = true;

        function validFormat(string) {
            if (string && string.length >= 6 && string.length <= 20) {
                return true;
            } else {
                return false;
            }
        }

        $scope.changePassword = function() {
            if (validFormat($scope.user.passwordCurrent) && validFormat($scope.user.passwordNew) &&
                validFormat($scope.user.passwordNewConfirm)) {
                //format validation
                $scope.passwordValid = true;

                //equality check
                if ($scope.user.passwordNew !== $scope.user.passwordNewConfirm) {
                    $scope.passwordEqual = false;
                } else {
                    $scope.passwordEqual = true;

                    //TODO : change request to server
                }
            } else {
                $scope.passwordValid = false;
            }
        };

    }];
});
