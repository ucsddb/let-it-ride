'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    EventModel = mongoose.model('Event'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var fs = require('fs'),
    parser = require('xml2json'),
    spawn = require('child_process').spawn,
    util = require('util'),
    geocoder = require('geocoder');

/**
 * Create a Event
 */
exports.create = function(req, res) {
    var evnt = new EventModel(req.body);

    evnt.save(function(err) {
        if(err) {
            console.error(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(evnt);
        }
    });
};

/**
 * Show the current Event
 */
exports.read = function(req, res) {
    res.json(req.evnt);
};

/**
 * Update a Event
 */
exports.update = function(req, res) {
    var evnt = req.evnt;

    evnt = _.extend(evnt, req.body);

    evnt.save(function(err) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(evnt);
        }
    });
};

/**
 * Delete an Event
 */
exports.delete = function(req, res) {
    var evnt = req.evnt;

    evnt.remove(function(err) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(evnt);
        }
    });
};

/**
 * List of Events
 */
exports.list = function(req, res) {
    EventModel.find().sort('-created').populate('location').exec(function(err, evnts) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(evnts);
        }
    });
};

exports.rides = function(req, res) {
    var data = req.body.data;
    if(data.length > 0) {
        // Google geocode api is rate limited to 10 per second
        // chunk them and send them ~1sec apart
        var promises = [],
            chunkIndex = 0,
            groupedByAddress = _.groupBy(data, 'address'),
            chunkedAddresses = _(groupedByAddress)
            .keys()
            .chunk(10)
            .value(),
            intervalId = setInterval(function() {
                if(chunkIndex >= chunkedAddresses.length) {
                    clearInterval(intervalId);
                    Promise.all(promises).then(function(vals) {
                        // res.json(groupedByAddress);
                        var str = '';

                        _.each(groupedByAddress, function(persons) {
                            _.each(persons, function(person) {
                                str += util.format('%s,%s,%s,%s,%s', person.name, person.longitude, person.latitude, person.attending, person.driving);
                                if(person.capacity) {
                                    str += util.format(',%s', person.capacity);
                                }
                                str += '\n';
                            });
                        });
                        
                        fs.writeFileSync('./scripts/n', str);
                        var child = spawn('/usr/bin/java', ['-jar', process.cwd()+'/scripts/genRides.jar'], {
                            cwd: './scripts',
                            stdio: 'inherit'
                        });

                        child.on('close', function(code) {
                            if(code !== 0) {
                                console.log('child exited with code: ' + code);
                                res.sendStatus(500);
                                return;
                            }

                            fs.readFile('/Users/dxu/Work/thing/output/shipment-problem-with-solution.xml', function(err, data) {
                                res.json(JSON.parse(parser.toJson(data)));
                            });
                        });

                        child.on('error', function(error) {
                            console.log(error);
                            res.send(error);
                        });
                    }, function(reason) {
                        console.log(reason);
                        res.sendStatus(500);
                    });
                    return;
                }
                var p = _.map(chunkedAddresses[chunkIndex], function(address) {
                    return new Promise(function(resolve, reject) {
                        geocoder.geocode(address, function(err, geoData) {
                            if(err || !geoData.results[0]) {
                                reject(err);
                                return;
                            }
                            _.each(groupedByAddress[address], function(person) {
                                person.longitude = geoData.results[0].geometry.location.lng;
                                person.latitude = geoData.results[0].geometry.location.lat;
                            });
                            resolve({
                                address: address,
                                longitude: geoData.results[0].geometry.location.lng,
                                latitude: geoData.results[0].geometry.location.lat
                            });
                        });
                    });
                });
                promises = promises.concat(p);
                chunkIndex += 1;
            }, 1500);
    } else {
        res.json({});
    }
};

/**
 * Event middleware
 */
exports.eventByID = function(req, res, next, id) {
    EventModel.findById(id).populate('location').populate('rsvps.user').exec(function(err, evnt) {
        if(err) return next(err);
        if(!evnt) return next(new Error('Failed to load Event ' + id));
        req.evnt = evnt;
        next();
    });
};
