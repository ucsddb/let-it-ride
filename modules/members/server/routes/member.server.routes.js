'use strict';

var members = require('../controllers/members.server.controller');

module.exports = function(app) {
    // Member collection Routes
    app.route('/api/members')
        .get(members.list)
        .post(members.create);

    app.route('/api/members/:memberId')
        .get(members.read)
        .put(members.update)
        .delete(members.delete);

    // Finish by binding the TestUser middleware
    app.param('memberId', members.memberByID);
};
