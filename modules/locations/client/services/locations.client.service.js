(function() {
    'use strict';

    //Locations service used to communicate Locations REST endpoints
    angular
        .module('locations')
        .factory('Locations', Locations);

    Locations.$inject = ['$resource'];

    function Locations($resource) {
        return $resource('api/locations/:locationId', {
            locationId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
})();
