'use strict';

/**
 * Module dependencies.
 */
var Acl = require('acl');

// Using the memory backend
Acl = new Acl(new Acl.memoryBackend());

/**
 * Invoke Locations Permissions
 */
exports.invokeRolesPolicies = function() {
    Acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: '/api/locations',
            permissions: '*'
        }, {
            resources: '/api/locations/:locationId',
            permissions: '*'
        }]
    }, {
        roles: ['user'],
        allows: [{
            resources: '/api/locations',
            permissions: ['get', 'post']
        }, {
            resources: '/api/locations/:locationId',
            permissions: ['get']
        }]
    }, {
        roles: ['guest'],
        allows: [{
            resources: '/api/locations',
            permissions: ['get']
        }, {
            resources: '/api/locations/:locationId',
            permissions: ['get']
        }]
    }]);
};

/**
 * Check If Locations Policy Allows
 */
exports.isAllowed = function(req, res, next) {
    var roles = (req.user) ? req.user.roles : ['guest'];

    // Check for user roles
    Acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
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
