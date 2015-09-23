'use strict';

var eventsPolicy = require('../policies/events.server.policy'),
    events = require('../controllers/events.server.controller');

module.exports = function(app) {
    // Events collection Routes
    app.route('/api/events').all(eventsPolicy.isAllowed)
        .get(events.list)
        .post(events.create);

    app.route('/api/events/:eventId').all(eventsPolicy.isAllowed)
        .get(events.read)
        .put(events.update)
        .delete(events.delete);

    app.route('/api/rides')
        .post(events.rides);

    // Finish by binding the Event middleware
    app.param('eventId', events.eventByID);
};
