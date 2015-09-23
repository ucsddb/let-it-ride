(function() {
    'use strict';

    // Events controller
    angular
        .module('events')
        .controller('EventsController', EventsController);

    EventsController.$inject = ['$scope', '$stateParams', '$location', '$sanitize', 'Authentication', 'Events', 'Locations', 'LocationUtilProvider'];

    function EventsController($scope, $stateParams, $location, $sanitize, Authentication, Events, Locations, LocationUtilProvider) {
        $scope.authentication = Authentication;

        $scope.getLocations = function() {
            $scope.locations = Locations.query();
        };

        // Create new Event
        $scope.create = function() {
            // Create new Event object
            var evnt = new Events({
                name: this.event.name,
                location: this.event.location._id
            });

            // Redirect after save
            evnt.$save(function(response) {
                $location.path('events/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Event
        $scope.remove = function(evnt) {
            if(evnt) {
                evnt.$remove();

                for(var i in $scope.events) {
                    if($scope.events[i] === evnt) {
                        $scope.events.splice(i, 1);
                    }
                }
            } else {
                $scope.evnt.$remove(function() {
                    $location.path('events');
                });
            }
        };

        // Update existing Event
        $scope.update = function() {
            var evnt = $scope.event;

            evnt.$update(function() {
                $location.path('events/' + evnt._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Events
        $scope.find = function() {
            $scope.events = Events.query();
        };

        // Find existing Event
        $scope.findOne = function() {
            $scope.event = Events.get({
                eventId: $stateParams.eventId
            });
            $scope.displayedUsers = [];
            $scope.event.$promise.then(function(response) {
                $scope.eventLocation = response.location;
                $scope.map = {
                    zoom: 15,
                    locationMarkers: []
                };
                LocationUtilProvider.then(function(LocationUtil) {
                    $scope.map.center = LocationUtil.getCenter([$scope.eventLocation]);
                    $scope.map.locationMarkers = LocationUtil.makeMarkers([$scope.eventLocation]);
                });
            });
        };
    }
})();
