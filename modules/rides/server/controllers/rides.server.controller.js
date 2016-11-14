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
    geocoder = require('geocoder'),
    redis = require('redis'),
    publisherClient = redis.createClient();

exports.test = function(req, res) {
    // let request last as long as possible
    req.socket.setTimeout(Infinity);

    var messageCount = 0;
    var subscriber = redis.createClient();

    subscriber.subscribe('updates');

    // In case we encounter an error...print it out to the console
    subscriber.on('error', function(err) {
        console.log('Redis Error: ' + err);
    });

    // When we receive a message from the redis connection
    subscriber.on('message', function(channel, message) {
        console.log('Message event: ' + message);

        var obj = JSON.parse(message);

        res.write('id: ' + obj.id + '\n');
        res.write('data: ' + message + '\n\n'); // Note the extra newline

        if(++messageCount >= 2 || obj.error) {
            subscriber.unsubscribe();
            subscriber.quit();
            res.end();
        }
    });

    //send headers for event-stream connection
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');

    // The 'close' event is fired when a user closes their browser window.
    // In that situation we want to make sure our redis channel subscription
    // is properly shut down to prevent memory leaks...and incorrect subscriber
    // counts to the channel.
    req.on('close', function() {
        subscriber.unsubscribe();
        subscriber.quit();
        console.log('Closing subscriber.');
    });
};

exports.generate = function(req, res) {
    var str = '',
        people = req.body.people,
        timestamp = req.body.id,
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
            stdio: 'inherit' //[0, 'pipe', 'pipe']
        });
        console.log(process.env.RIDE_GEN_HEAP_SIZE);
        child.on('close', function(code) {
            if(code !== 0) {
                console.log('child exited with code: ' + code);
                publisherClient.publish('updates', JSON.stringify({
                    id: timestamp,
                    error: 'Error: Something went wrong..'
                }));
                return;
            }
            var outputFile = './scripts/output/out-' + timestamp + '.xml';
            console.log('DONE, Reading ' + outputFile);
            var result = parser.toJson(fs.readFileSync(outputFile).toString('utf8'), {
                object: true
            });
            var solutions = _.get(result, 'problem.solutions.solution');
            var routes = _.get(_.min(solutions, function(sol) {
                return sol.cost;
            }), 'routes.route', []);
            var assignments = _.map(routes, function(r) {
                return {
                    driver: r.vehicleId,
                    passengers: _(r.act).pluck('shipmentId').uniq().value()
                };
            });
            publisherClient.publish('updates', JSON.stringify({
                id: timestamp,
                assignments: assignments
            }));
        });

        child.on('error', function(error) {
            console.log(error);
            publisherClient.publish('updates', JSON.stringify({
                    id: timestamp,
                    error: error
                }));
            return;
        });
        res.sendStatus(200);
    } else {
        return res.status(400).send({
            message: 'People please..'
        });
    }
};
