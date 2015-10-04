'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Location Schema
 */
var LocationSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    address: {
        type: String,
        default: '',
        required: 'Please enter an address',
        trim: true
    },
    nickname: {
        type: String,
        default: '',
        trim: true
    }
});

LocationSchema.index({location: '2dsphere'});

mongoose.model('Location', LocationSchema);
