'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Response Schema
 */
var ResponseSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    response: {
        type: String,
        enum: ['Yes', 'No', 'Not Answered'],
        default: 'Not Answered'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    comment: {
        type: String,
        trim: true,
        default: ''
    },
    canDrive: Boolean
});

/**
 * Event Schema
 */
var EventSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        default: '',
        trim: true,
        required: 'Please enter a name for the event.'
    },
    location: {
        type: Schema.ObjectId,
        ref: 'Location'
    },
    rsvps: [ResponseSchema]
});

mongoose.model('Event', EventSchema);
