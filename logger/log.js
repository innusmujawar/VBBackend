/*
 |--------------------------------------------------------------------------
 | Debug and Log all Data to log files
 |--------------------------------------------------------------------------
 */


var config = require('../config');
var fs = require('fs');
var dir = './log';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

var winston = require('winston');
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');


var winstonLogger = new (winston.Logger)({
  transports: [
    //new (winston.transports.Console)({ json: true, timestamp: true }),
    //new winston.transports.File({ filename: __dirname + '/debug.log', json: true }),
    new (require('winston-daily-rotate-file'))({ filename: config.PROJECT_DIR + '/log/request.log', json: true })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: true, timestamp: true }),
    //new (require('winston-daily-rotate-file'))({ filename: __dirname + '../../log/exceptions.log', json: true })
  ],
  exitOnError: false
});

module.exports = winstonLogger;