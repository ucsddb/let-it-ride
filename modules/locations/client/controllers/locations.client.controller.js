(function() {
    'use strict';

    // Locations controller
    angular
        .module('locations')
        .controller('LocationsController', LocationsController);

    LocationsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Locations', 'LocationUtilProvider'];

    function LocationsController($scope, $stateParams, $location, Authentication, Locations, LocationUtilProvider) {
        $scope.authentication = Authentication;

        // Create new Location
        $scope.create = function() {
            // Create new Location object
            var location = new Locations({
                address: this.address
            });

            // Redirect after save
            location.$save(function(response) {
                $location.path('locations/' + response._id);

                // Clear form fields
                $scope.address = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Location
        $scope.remove = function(location) {
            if(location) {
                location.$remove();

                for(var i in $scope.locations) {
                    if($scope.locations[i] === location) {
                        $scope.locations.splice(i, 1);
                    }
                }
            } else {
                $scope.location.$remove(function() {
                    $location.path('locations');
                });
            }
        };

        // Update existing Location
        $scope.update = function() {
            var location = $scope.location;

            location.$update(function() {
                $location.path('locations/' + location._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Locations
        $scope.find = function() {
            $scope.locations = Locations.query();
            $scope.map = {
                zoom: 14,
                locationMarkers: []
            };
            $scope.locations.$promise.then(function() {
                LocationUtilProvider.then(function(LocationUtil) {
                    $scope.map.bounds = LocationUtil.getBounds($scope.locations);
                    $scope.map.center = LocationUtil.getCenter($scope.locations);
                    $scope.map.locationMarkers = LocationUtil.makeMarkers($scope.locations);
                });
            });
        };

        // Find existing Location
        $scope.findOne = function() {
            $scope.location = Locations.get({
                locationId: $stateParams.locationId
            });
            $scope.map = {
                zoom: 15,
                locationMarkers: []
            };
            $scope.location.$promise.then(function() {
                LocationUtilProvider.then(function(LocationUtil) {
                    $scope.map.center = LocationUtil.getCenter([$scope.location]);
                    $scope.map.locationMarkers = LocationUtil.makeMarkers([$scope.location]);
                });
            });
        };
    }
})();
