'use strict';

/**
 * Module dependencies.
 */
var geocoder = require('geocoder'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    LocationModel = mongoose.model('Location'),
    util = require('util');

/**
 * Member Schema
 */
var MemberSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    defaultLocation: {
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
    address: {
        type: String,
        trim: true,
        default: ''
    },
    driver: {
        type: Boolean,
        default: false
    }
});

MemberSchema.pre('save', function(next) {
    if(this.address) {
        var _this = this;
        geocoder.geocode(this.address, function(err, data) {
            if(err) {
                next(err);
            } else {
                LocationModel.geoNear({
                    type: 'Point',
                    coordinates: [data.results[0].geometry.location.lng, data.results[0].geometry.location.lat]
                }, {
                    maxDistance: 1,
                    spherical: true,
                    limit: 1
                }, function(err, loc) {
                    if(err) {
                        next(err);
                    } else {
                        if(!loc.length) {
                            loc = new LocationModel({
                                address: data.results[0].formatted_address,
                                location: {
                                    coordinates: [data.results[0].geometry.location.lng, data.results[0].geometry.location.lat]
                                }
                            });
                            loc.save().then(function(res) {
                                _this.defaultLocation = loc;
                                next();
                            }, function(err) {
                                next(err);
                            });
                        } else {
                            _this.defaultLocation = loc[0].obj;
                            next();
                        }
                    }
                });
            }
        });
    } else {
        next();
    }
});

mongoose.model('Member', MemberSchema);
