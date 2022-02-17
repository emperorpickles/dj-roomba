const bunyan = require('bunyan');

const {LoggingBunyan} = require('@google-cloud/logging-bunyan');
const loggingBunyan = new LoggingBunyan();

module.exports = bunyan.createLogger({
    name: 'dj-roomba',
    streams: [
        {stream: process.stdout, level: 'info'},
        loggingBunyan.stream('info'),
    ],
});
