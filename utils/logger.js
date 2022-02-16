const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');

const loggingWinston = new LoggingWinston();

const enumerateErrorFormat = winston.format(info => {
    if (info.message instanceof Error) {
        info.message = Object.assign({
            message: info.message.message,
            stack: info.message.stack
        }, info.message);
    }

    if (info instanceof Error) {
        return Object.assign({
            message: info.message,
            stack: info.stack
        }, info);
    }
    
    return info;
});

const logConfiguration = {
    level: 'info',
    format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        loggingWinston,
    ],
}

module.exports = winston.createLogger(logConfiguration);
