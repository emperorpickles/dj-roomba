const bunyan = require('bunyan');

const {LoggingBunyan} = require('@google-cloud/logging-bunyan');
var loggingOptions = {};
if (process.env.GCP_PROJECT_ID) {
    const loggingBunyan = new LoggingBunyan();

    loggingOptions = {
        name: 'dj-roomba',
        streams: [
            {stream: process.stdout, level: 'info'},
            loggingBunyan.stream('info'),
        ],
    }
} else {
    loggingOptions = {
        name: 'dj-roomba',
        streams: [
            {stream: process.stdout, level: 'debug'},
            {
                type: 'rotating-file',
                path: './logs/dj-roomba.log',
                period: '1d',
                count: 3,
                level: 'debug'
            },
        ],
    }
}

module.exports = bunyan.createLogger(loggingOptions);
