(function() {
    'use strict';

    //Setting up route
    angular
        .module('rides')
        .config(configure);

    configure.$inject = ['$stateProvider'];

    function configure($stateProvider) {
        // Rides state routing
        $stateProvider.
        state('rides', {
            abstract: true,
            url: '/rides',
            template: '<ui-view/>'
        }).
        state('rides.generate', {
            url: '',
            templateUrl: 'modules/rides/views/generate-rides.client.view.html'
        });
    }
})();
