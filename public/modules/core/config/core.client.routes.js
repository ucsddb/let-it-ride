'use strict';

// Setting up route
angular.module('core', ['users']).config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
])
.run(function($rootScope, $location, Authentication) {
	// TODO: find a better way to enforce authentication to prevent 
	// the need to authenticate during testing
	$rootScope.$on('$locationChangeStart', function(event, next, current) {
		var whiteList = ['/signup', '/password/forgot'];

		if(!angular.isObject(Authentication.user)) {
			if(whiteList.indexOf($location.path()) > -1)
				return;
			$location.path('/signin');
		}
	});
});