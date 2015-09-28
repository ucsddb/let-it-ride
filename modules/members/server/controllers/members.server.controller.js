'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    MemberModel = mongoose.model('Member'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Member
 */
exports.create = function(req, res) {
    var member = new MemberModel(req.body);

    member.save(function(err) {
        if(err) {
            console.error(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(member);
        }
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
    MemberModel.find().sort('-created').populate('defaultLocation').exec(function(err, members) {
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
    MemberModel.findById(id).populate('defaultLocation').exec(function(err, member) {
        if(err) return next(err);
        if(!member) return next(new Error('Failed to load Member ' + id));
        req.member = member;
        next();
    });
};
