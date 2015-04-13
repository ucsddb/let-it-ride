(function() {
    'use strict';

    angular
        .module('core')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['$scope', '$state', 'Authentication', 'Menus'];

    function HeaderController($scope, $state, Authentication, Menus) {
        var header = this;
        header.$state = $state;
        header.authentication = Authentication;

        // Get the topbar menu
        header.menu = Menus.getMenu('topbar');

        // Toggle the menu items
        header.isCollapsed = false;
        header.toggleCollapsibleMenu = toggleCollapsibleMenu;

        function toggleCollapsibleMenu() {
            header.isCollapsed = !header.isCollapsed;
        }
    }
})();
