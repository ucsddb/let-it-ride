'use strict';

var ridesPolicy = require('../policies/rides.server.policy'),
    rides = require('../controllers/rides.server.controller');

module.exports = function(app) {
    // Rides collection Routes
    app.route('/api/rides').all(ridesPolicy.isAllowed)
        .post(rides.generate);
};
