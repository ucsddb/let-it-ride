(function() {
    'use strict';

    // Configuring the Locations module
    angular
        .module('rides')
        .run(runBlock);

    runBlock.$inject = ['Menus'];

    function runBlock(Menus) {
        // Add the events dropdown item
        Menus.addMenuItem('topbar', {
            title: 'Rides',
            state: 'rides.generate',
            roles: ['*'],
            isPublic: false
        });
    }
})();
