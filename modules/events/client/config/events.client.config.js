(function() {
    'use strict';

    // Configuring the Locations module
    angular
        .module('events')
        .run(runBlock);

    runBlock.$inject = ['Menus'];

    function runBlock(Menus) {
        // Add the events dropdown item
        Menus.addMenuItem('topbar', {
            title: 'Events',
            state: 'events',
            roles: ['admin'],
            type: 'dropdown',
            isPublic: false
        });

        // Add the dropdown list item
        Menus.addSubMenuItem('topbar', 'events', {
            title: 'List Events',
            state: 'events.list'
        });

        // Add the dropdown create item
        Menus.addSubMenuItem('topbar', 'events', {
            title: 'Create Events',
            state: 'events.create'
        });
    }
})();
