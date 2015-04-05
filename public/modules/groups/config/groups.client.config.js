'use strict';

// Configuring the Articles module
angular.module('groups').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Groups', 'groups', 'dropdown', '/groups(/create)?', false, ['admin']);
		Menus.addSubMenuItem('topbar', 'groups', 'List Groups', 'groups');
		Menus.addSubMenuItem('topbar', 'groups', 'New Group', 'groups/create');
	}
]);