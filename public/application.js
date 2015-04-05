'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName)
.config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
])
.config(['uiGmapGoogleMapApiProvider',
	function(uiGmapGoogleMapApiProvider) {
	    uiGmapGoogleMapApiProvider.configure({
           	// key: 'your api key',
	        v: '3.17',
	        libraries: 'weather,geometry,visualization'
	    });
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});