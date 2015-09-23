(function() {
    'use strict';

    // Events service used to communicate Events REST endpoints
    angular
        .module('events')
        .factory('Events', Events)
        .factory('Rides', Rides);

    Events.$inject = ['$resource'];
    Rides.$inject = ['$resource'];

    function Events($resource) {
        return $resource('api/events/:eventId', {
            eventId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }

    function Rides($resource) {
        return $resource('api/rides');
    }
})();
