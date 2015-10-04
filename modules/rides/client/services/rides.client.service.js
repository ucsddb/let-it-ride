(function() {
    'use strict';

    // Rides service used to communicate Rides REST endpoints
    angular
        .module('rides')
        .factory('Rides', Rides);

    Rides.$inject = ['$resource'];

    function Rides($resource) {
        return $resource('api/rides');
    }
})();
