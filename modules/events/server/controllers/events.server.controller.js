'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    EventModel = mongoose.model('Event'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var fs = require('fs'),
    parser = require('xml2json'),
    spawn = require('child_process').spawn,
    util = require('util'),
    geocoder = require('geocoder');

/**
 * Create a Event
 */
exports.create = function(req, res) {
    var evnt = new EventModel(req.body);

    evnt.save(function(err) {
        if(err) {
            console.error(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(evnt);
        }
    });
};

/**
 * Show the current Event
 */
exports.read = function(req, res) {
    res.json(req.evnt);
};

/**
 * Update a Event
 */
exports.update = function(req, res) {
    var evnt = req.evnt;

    evnt = _.extend(evnt, req.body);

    evnt.save(function(err) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(evnt);
        }
    });
};

/**
 * Delete an Event
 */
exports.delete = function(req, res) {
    var evnt = req.evnt;

    evnt.remove(function(err) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(evnt);
        }
    });
};

/**
 * List of Events
 */
exports.list = function(req, res) {
    EventModel.find().sort('-created').populate('location').exec(function(err, evnts) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(evnts);
        }
    });
};

/**
 * Event middleware
 */
exports.eventByID = function(req, res, next, id) {
    EventModel.findById(id).populate('location').populate('rsvps.user').exec(function(err, evnt) {
        if(err) return next(err);
        if(!evnt) return next(new Error('Failed to load Event ' + id));
        req.evnt = evnt;
        next();
    });
};
