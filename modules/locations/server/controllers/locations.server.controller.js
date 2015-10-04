'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    geocoder = require('geocoder'),
    Location = mongoose.model('Location'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.addressToLocation = function(address) {
    return new Promise(function(resolve, reject) {
        geocoder.geocode(address, function(err, data) {
            if(err) {
                reject(err);
            } else {
                Location.geoNear({
                    type: 'Point',
                    coordinates: [data.results[0].geometry.location.lng, data.results[0].geometry.location.lat]
                }, {
                    maxDistance: 1,
                    spherical: true,
                    limit: 1
                }, function(err, loc) {
                    if(err) {
                        reject(err);
                    } else {
                        if(!loc.length) {
                            loc = new Location({
                                address: data.results[0].formatted_address,
                                location: {
                                    coordinates: [data.results[0].geometry.location.lng, data.results[0].geometry.location.lat]
                                }
                            });
                            loc.save().then(function(res) {
                                resolve(res);
                            }, function(err) {
                                reject(err);
                            });
                        } else {
                            resolve(loc[0].obj);
                        }
                    }
                });
            }
        });
    });
};

/**
 * Create a Location
 */
exports.create = function(req, res) {
    this.addressToLocation(req.body.address).then(function(location) {
        res.json(location);
    }).catch(function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
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
