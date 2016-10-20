'use strict';
const winston = require('winston'),
      container = new winston.Container(),
      config = require('../config/config'),
      fs = require('fs'),
      path = require('path'),
      SlackHook = require('winston-slack-hook');


winston.emitErrs = true;

// ensure log directories exist
const log_path = process.cwd() + config.log_dir;
fs.existsSync(log_path) || fs.mkdirSync(log_path);
const logSubDirs =  ["general", "requests", "errors", "exceptions"];
logSubDirs.forEach((dir) => {
  fs.existsSync(`${log_path}/${dir}`) || fs.mkdirSync(`${log_path}/${dir}`);
});

// general Logger
winston.loggers.add('general', {
  transports: [
    new (winston.transports.Console)({
      level: 'info',
      colorize: true,
      label: 'general',
      timestamp: true
    }),
    new (require("winston-daily-rotate-file"))({
      name : "general-rotation-file",
      filename : "./logs/general/general.log",
      prepend: true,
      datePattern : "yyyy-MM-dd_",
      timestamp : true,
      level: "silly",
      json: true,
      maxFiles : 14
    }),
    new SlackHook({
      hookUrl: config.slack_webhook,
      username: 'generalBot@kroneused-trailer.com',
      iconEmoji: ':white_check_mark:',
      channel: '#log_general',
      formatter: (options) => {
        return `${new Date()} - ${options.message}`;
      }
    })
  ]
});

// Request Logger
winston.loggers.add('requests', {
  transports: [
    new (winston.transports.Console)({
      level: 'info',
      colorize: true,
      label: 'requests',
      timestamp: true
    }),
    new (require("winston-daily-rotate-file"))({
      name : "requests-rotation-file",
      filename : "./logs/requests/requests.log",
      prepend: true,
      datePattern : "yyyy-MM-dd_",
      timestamp : true,
      level: "silly",
      json: true,
      maxFiles : 14
    }),
    new SlackHook({
      hookUrl: config.slack_webhook,
      username: 'requestBot@kroneused-trailer.com',
      iconEmoji: ':unicorn_face:',
      channel: '#log_requests',
      formatter: (options) => {
        return `${new Date()} - ${options.message}`;
      }
    })
  ]
});

// Mail Logger
winston.loggers.add('errors', {
  transports: [
    new (winston.transports.Console)({
      level: 'error',
      colorize: true,
      label: 'errors',
      timestamp: true
    }),
    new (require("winston-daily-rotate-file"))({
      name : "errors-rotation-file",
      filename : "./logs/errors/errors.log",
      prepend: true,
      datePattern : "yyyy-MM-dd_",
      timestamp : true,
      level: "silly",
      json: true,
      maxFiles : 14
    }),
    new SlackHook({
      hookUrl: config.slack_webhook,
      username: 'errorBot@kroneused-trailer.com',
      iconEmoji: ':bangbang:',
      channel: '#log_errors',
      formatter: (options) => {
        return `${new Date()} - ${options.message}`;
      }
    })
  ]
});

winston.handleExceptions([
  new (winston.transports.Console)({
    level: 'error',
    colorize: true,
    label: 'exception',
    timestamp: true,
    json: true
  }),
  new (require("winston-daily-rotate-file"))({
    name : "exception-rotation-file",
    filename : "./logs/exceptions/exceptions.log",
    prepend: true,
    datePattern : "yyyy-MM-dd_",
    timestamp : true,
    level: "silly",
    json: true,
    maxFiles : 14
  }),
  new SlackHook({
    hookUrl: config.slack_webhook,
    username: 'exceptionBot@kroneused-trailer.com',
    iconEmoji: ':skull_and_crossbones:',
    channel: '#log_exceptions',
    appendMeta: false,
    formatter: (options) =>{
      return `${new Date()} - *uncaught Exception*  - \n${options.meta.stack}`;
    }
  })
]);

// export stream to 'requests' transports
module.exports.stream = {
    write: function(message, encoding){
        winston.loggers.get('requests').info(message);
    }
};
