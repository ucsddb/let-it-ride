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
	geometry: {
		type: [Number],
		default: [0,0],
		index: '2dsphere'
	},
	address: {
		type: String,
		default: '',
		required: 'Please enter an address',
		trim: true
	}
});

// LocationSchema.index({geometry: '2dsphere'});

LocationSchema.pre('save', function(next) {
	if (this.address) {
		var _this = this;
		geocoder.geocode(this.address, function(err, data) {
			_this.address = data.results[0].formatted_address;
			_this.geometry = [data.results[0].geometry.location.lng, data.results[0].geometry.location.lat];
			next(err);
		});
	}
});

/**
 * Find possible not used locations
 */
// LocationSchema.statics.findUniqueLocation = function(address, callback) {
// 	var _this = this;

// 	_this.findOne({
// 		address: address
// 	}, function(err, user) {
// 		if (!err) {
// 			if (!user) {
// 				callback(possibleUsername);
// 			} else {
// 				return _this.findUniqueLocation(username, (suffix || 0) + 1, callback);
// 			}
// 		} else {
// 			callback(null);
// 		}
// 	});
// };

mongoose.model('Location', LocationSchema);