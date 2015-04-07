'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

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
]);