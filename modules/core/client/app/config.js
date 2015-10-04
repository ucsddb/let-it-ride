'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
    // Init module configuration options
    var applicationModuleName = 'let-it-ride';
    var applicationModuleVendorDependencies = ['ngResource', 'ngSanitize', 'ngAnimate', 'ui.router', 'ui.bootstrap',
         'ui.bootstrap.datetimepicker', 'ui.utils', 'uiGmapgoogle-maps', 'ui.grid', 'ui.grid.selection',
         'ui.grid.edit', 'ui.select'
    ];

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };

    // Add a new vertical module
    function registerModule(moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    }
})();
