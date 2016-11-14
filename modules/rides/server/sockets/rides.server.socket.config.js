'use strict';

var _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    parser = require('xml2json'),
    spawn = require('child_process').spawn,
    util = require('util'),
    geocoder = require('geocoder'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Module dependencies.
 */
module.exports = function(io, socket) {
    socket.on('rideMessage', function(message) {
        var str = '',
            people = message.people,
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
                stdio: 'pipe'
            });
            child.stdout.on('data', function(data) {
                if(!data)
                    return;
                var msg = data.toString();
                if(msg.indexOf('$Counter - iterations') > -1) {
                    var its = msg.match(/Counter - iterations\s+(\d+)/);
                    if(its !== null && its.length > 1) {
                        var prog = Number(its[1]),
                            total = Number(process.env.MAX_ITERATIONS);
                        io.emit('rideMessage', {
                            id: message.id,
                            progress: (prog / total).toFixed(2)
                        });
                    }
                }
            });
            child.on('close', function(code) {
                if(code !== 0) {
                    console.log('child exited with code: ' + code);
                    io.emit('rideMessage', {
                        message: 'Woops.. something happened..'
                    });
                }
                var outputFile = './scripts/output/out-' + timestamp + '.xml';
                console.log('DONE, Reading ' + outputFile);

                fs.readFile(outputFile, function(err, data) {
                    if(err) {
                        io.emit('rideMessage', {
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                    io.emit('rideMessage', {
                        id: message.id,
                        progress: 1
                    });
                    io.emit('rideMessage', {
                        result: parser.toJson(data, {
                            object: true,
                        }),
                        id: message.id
                    });
                });
            });

            child.on('error', function(error) {
                console.log(error);
                io.emit('rideMessage', {
                    message: errorHandler.getErrorMessage(error)
                });
            });
        }
    });
};
