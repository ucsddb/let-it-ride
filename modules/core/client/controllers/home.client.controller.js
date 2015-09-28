(function() {
    'use strict';

    angular
        .module('core')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Authentication'];

    function HomeController($scope, Authentication) {
        var vm = this;
        // This provides Authentication context.
        vm.authentication = Authentication;

        init();

        // TODO: figure out way to use container class for all views except home
        // Ugly hack to remove container class to the view content for Home page image
        $scope.$on('$destroy', function() {
            angular.element(document.getElementsByClassName('main-container')).addClass('container');
        });

        function init() {
            angular.element(document.getElementsByClassName('main-container')).removeClass('container');
        }
    }
})();
