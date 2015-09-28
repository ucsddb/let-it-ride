'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
    }
});

mongoose.model('Member', MemberSchema);
