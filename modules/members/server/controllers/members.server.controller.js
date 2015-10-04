'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    util = require('util'),
    geocoder = require('geocoder'),
    mongoose = require('mongoose'),
    MemberModel = mongoose.model('Member'),
    LocationModel = mongoose.model('Location'),
    LocationController = require(path.resolve('./modules/locations/server/controllers/locations.server.controller')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create Members
 */
exports.create = function(req, res) {
    var memberObjs = _.isArray(req.body) ? req.body : [req.body];
    var addresses = _(memberObjs)
        .map(function(member) {
            return [member.pickupLocation, member.dropoffLocation];
        })
        .flatten()
        .uniq()
        .value();

    Promise.all(_.map(addresses, LocationController.addressToLocation)).then(function(values) {
        var members, savePromises,
            addressToLocationMap = _.zipObject(addresses, values);

        _.each(memberObjs, function(member) {
            member.pickupLocation = addressToLocationMap[member.pickupLocation];
            member.dropoffLocation = addressToLocationMap[member.dropoffLocation];
        });

        members = _.map(memberObjs, function(memberObj) {
            return new MemberModel(memberObj);
        });
        savePromises = _.map(members, function(member) {
            return member.save();
        });

        Promise.all(savePromises).then(function(values) {
            res.json(values);
        }).catch(function(err) {
            console.error(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    }).catch(function(err) {
        console.error(err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * Show the current Member
 */
exports.read = function(req, res) {
    res.json(req.member);
};

/**
 * Update a Member
 */
exports.update = function(req, res) {
    var member = req.member;

    member = _.extend(member, req.body);

    member.save(function(err) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(member);
        }
    });
};

/**
 * Delete an Member
 */
exports.delete = function(req, res) {
    var member = req.member;

    member.remove(function(err) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(member);
        }
    });
};

/**
 * List of Members
 */
exports.list = function(req, res) {
    MemberModel.find().sort('name').populate('pickupLocation').populate('dropoffLocation').exec(function(err, members) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(members);
        }
    });
};

/**
 * Member middleware
 */
exports.memberByID = function(req, res, next, id) {
    MemberModel.findById(id).populate('pickupLocation').populate('dropoffLocation').exec(function(err, member) {
        if(err) return next(err);
        if(!member) return next(new Error('Failed to load Member ' + id));
        req.member = member;
        next();
    });
};
