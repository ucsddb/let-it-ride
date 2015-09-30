'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    geocoder = require('geocoder');

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
    }
});

LocationSchema.index({location: '2dsphere'});

LocationSchema.pre('save', function(next) {
    if(this.address) {
        var _this = this;
        geocoder.geocode(this.address, function(err, data) {
            _this.address = data.results[0].formatted_address;
            _this.location.coordinates = [data.results[0].geometry.location.lng, data.results[0].geometry.location.lat];
            next(err);
        });
    }
});

mongoose.model('Location', LocationSchema);
