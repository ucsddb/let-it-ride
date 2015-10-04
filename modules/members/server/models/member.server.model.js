'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    LocationModel = mongoose.model('Location');

/**
 * Member Schema
 */
var MemberSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    pickupLocation: {
        type: Schema.ObjectId,
        ref: 'Location'
    },
    dropoffLocation: {
        type: Schema.ObjectId,
        ref: 'Location'
    },
    name: {
        type: String,
        trim: true,
        default: '',
    },
    email: {
        type: String,
        trim: true,
        default: '',
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    driver: {
        type: Boolean,
        default: false
    },
    capacity: {
        type: Number,
        default: 4
    }
});

mongoose.model('Member', MemberSchema);
