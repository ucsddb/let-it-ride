(function() {
    'use strict';

    //Members service used to communicate Members REST endpoints
    angular
        .module('members')
        .factory('Members', Members);

    Members.$inject = ['$resource'];

    function Members($resource) {
        return $resource('api/members/:memberId', {
            memberId: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            saveAll: {
                method: 'POST',
                isArray: true
            }
        });
    }
})();
