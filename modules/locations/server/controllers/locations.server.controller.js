'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Location = mongoose.model('Location'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Location
 */
exports.create = function(req, res) {
    var location = new Location(req.body);

    location.save(function(err) {
        if(err) {
            console.error(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(location);
        }
    });
};

/**
 * Show the current Location
 */
exports.read = function(req, res) {
    res.json(req.location);
};

/**
 * Update a Location
 */
exports.update = function(req, res) {
    var location = req.location;

    location = _.extend(location, req.body);

    location.save(function(err) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(location);
        }
    });
};

/**
 * Delete an Location
 */
exports.delete = function(req, res) {
    var location = req.location;

    location.remove(function(err) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(location);
        }
    });
};

/**
 * List of Locations
 */
exports.list = function(req, res) {
    Location.find().sort('-created').populate('user', 'displayName').exec(function(err, locations) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(locations);
        }
    });
};

/**
 * Location middleware
 */
exports.locationByID = function(req, res, next, id) {
    Location.findById(id).populate('user', 'displayName').exec(function(err, location) {
        if(err) return next(err);
        if(!location) return next(new Error('Failed to load Location ' + id));
        req.location = location;
        next();
    });
};
