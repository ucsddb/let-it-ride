'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * EventResponse Schema
 */
var EventResponseSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	attending: {
		type: Boolean,
		default: false,
		required: 'Please fill whether or not you are attending'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	comment: {
		type: String,
		default: '',
		trim: true
	},
	canDrive: {
		type: Boolean,
		default: false
	}
});

/**
 * Event Schema
 */
var EventSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Event name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	startDate: {
		type: Date
	},
	endDate: {
		type: Date
	},
	location: {
		type: Schema.ObjectId,
		ref: 'Location'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	invitees: [{
		type: Schema.ObjectId,
		ref: 'User'
	}],
	responses: [EventResponseSchema],
	isPublic: {
		type: Boolean,
		default: true
	}
});

mongoose.model('Event', EventSchema);