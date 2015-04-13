(function() {
    'use strict';

    // Setting up route
    angular
        .module('core')
        .config(configure);

    configure.$inject = ['$stateProvider', '$urlRouterProvider'];

    function configure($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
            state('home', {
                url: '/',
                templateUrl: 'modules/core/views/home.client.view.html'
            });
    }
})();
