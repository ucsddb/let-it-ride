'use strict';

var locationsPolicy = require('../policies/locations.server.policy'),
    locations = require('../controllers/locations.server.controller');

module.exports = function(app) {
    // Locations collection Routes
    app.route('/api/locations').all(locationsPolicy.isAllowed)
        .get(locations.list)
        .post(locations.create);

    app.route('/api/locations/:locationId').all(locationsPolicy.isAllowed)
        .get(locations.read)
        .put(locations.update)
        .delete(locations.delete);

    // Finish by binding the Location middleware
    app.param('locationId', locations.locationByID);
};
