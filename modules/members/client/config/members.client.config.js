(function() {
    'use strict';

    // Configuring the Members module
    angular
        .module('members')
        .run(runBlock);

    runBlock.$inject = ['Menus'];

    function runBlock(Menus) {
        // Add the Members dropdown item
        Menus.addMenuItem('topbar', {
            title: 'Members',
            state: 'members',
            roles: ['*'],
            type: 'dropdown'
        });

        // Add the dropdown list item
        Menus.addSubMenuItem('topbar', 'members', {
            title: 'List Members',
            state: 'members.list'
        });

        // Add the dropdown create item
        Menus.addSubMenuItem('topbar', 'members', {
            title: 'Create Members',
            state: 'members.create'
        });
    }
})();
