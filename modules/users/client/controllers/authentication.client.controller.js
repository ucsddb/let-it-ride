(function() {
    'use strict';

    angular
        .module('users')
        .controller('AuthenticationController', AuthenticationController);

    AuthenticationController.$inject = ['$scope', '$http', '$location', 'Authentication', 'Locations'];

    function AuthenticationController($scope, $http, $location, Authentication, Locations) {
        $scope.authentication = Authentication;

        // If user is signed in then redirect back home
        if($scope.authentication.user) $location.path('/');

        $scope.locations = Locations.query();

        $scope.signup = function() {
            $http.post('/api/auth/signup', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;

                // And redirect to the index page
                $location.path('/');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.signin = function() {
            $http.post('/api/auth/signin', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;

                // And redirect to the index page
                $location.path('/');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
})();
