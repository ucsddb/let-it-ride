'use strict';

// Configuring the Articles module
angular.module('locations').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Locations', 'locations', 'dropdown', '/locations(/create)?', false, ['admin']);
		Menus.addSubMenuItem('topbar', 'locations', 'List Locations', 'locations');
		Menus.addSubMenuItem('topbar', 'locations', 'New Locations', 'locations/create');
	}
]);