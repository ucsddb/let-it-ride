'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
/* jshint ignore:start */
acl = new acl(new acl.memoryBackend());
/* jshint ignore:end */

/**
 * Invoke Events Permissions
 */
exports.invokeRolesPolicies = function() {
    acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: '/api/events',
            permissions: '*'
        }, {
            resources: '/api/events/:eventId',
            permissions: '*'
        }]
    }, {
        roles: ['user'],
        allows: [{
            resources: '/api/events',
            permissions: ['get', 'post']
        }, {
            resources: '/api/events/:eventId',
            permissions: ['get']
        }]
    }, {
        roles: ['guest'],
        allows: [{
            resources: '/api/events',
            permissions: ['get']
        }, {
            resources: '/api/events/:eventId',
            permissions: ['get']
        }]
    }]);
};

/**
 * Check If Events Policy Allows
 */
exports.isAllowed = function(req, res, next) {
    var roles = (req.user) ? req.user.roles : ['guest'];

    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
        if(err) {
            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        } else {
            if(isAllowed) {
                // Access granted! Invoke next middleware
                return next();
            } else {
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });
};
