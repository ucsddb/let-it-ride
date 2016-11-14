'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    RideModel = mongoose.model('Ride'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var fs = require('fs'),
    parser = require('xml2json'),
    spawn = require('child_process').spawn,
    util = require('util'),
    geocoder = require('geocoder');

exports.generate = function(req, res) {
    var str = '',
        people = req.body.people,
        timestamp = new Date().getTime().toString(),
        inputFile = './scripts/input/in-' + timestamp;

    if(people.length > 0) {
        _.each(people, function(person) {
            var startLong = person.start.longitude,
                startLat = person.start.latitude,
                endLong = person.end.longitude,
                endLat = person.end.latitude;
            str += util.format('%s,%s,%s,%s,%s,%s,%s\n', person.name, startLong, startLat, endLong, endLat, person.driver, person.capacity);
        });
        fs.writeFileSync(inputFile, str);
        var child = spawn('/usr/bin/java', ['-jar', '-Xmx' + process.env.RIDE_GEN_HEAP_SIZE + 'm', process.cwd() + '/scripts/genRides.jar', timestamp], {
            cwd: './scripts',
            stdio: 'inherit'
        });
        console.log(process.env.RIDE_GEN_HEAP_SIZE);
        child.on('close', function(code) {
            if(code !== 0) {
                console.log('child exited with code: ' + code);
                return res.status(500).send({
                    message: 'Woops.. something happened..'
                });
            }
            var outputFile = './scripts/output/out-' + timestamp + '.xml';
            console.log('DONE, Reading ' + outputFile);

            fs.readFile(outputFile, function(err, data) {
                if(err) {
                    return res.status(500).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                res.json(parser.toJson(data, {
                    object: true,
                }));
            });
        });

        child.on('error', function(error) {
            console.log(error);
            return res.status(500).send({
                message: errorHandler.getErrorMessage(error)
            });
        });
    } else {
        return res.status(400).send({
            message: 'Both destination and people are required.'
        });
    }
};
