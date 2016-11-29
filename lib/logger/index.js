const winston = require('winston');
const fs = require('fs');
const config = require('../../config/config');
const WinstonDailyRotate = require('winston-daily-rotate-file');
const WinstonSlack = require('winston-slack-hook');

winston.configure({
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      label: 'general',
      level: config.logs.level,
      prettyPrint: true,
      timestamp: true
    }),
    new WinstonDailyRotate({
      name: 'general-rotation-file',
      filename: `./${createLogDir()}/general.log`,
      prepend: true,
      datePattern: 'yyyy-MM-dd_',
      timestamp: true,
      level: config.logs.level,
      json: true,
      maxFiles: 14,
    })
  ]
});

const exceptionTransports = [
  new winston.transports.Console({
    colorize: true,
    prettyPrint: true,
    timestamp: true
  })
];

if (process.env.NODE_ENV === 'production') {
  exceptionTransports.push(
    new WinstonSlack({
      hookUrl: config.slack.webhook,
      username: 'exceptionBot@citeplag.org',
      iconEmoji: ':skull_and_crossbones:',
      channel: config.slack.channels.exceptions,
      appendMeta: false,
      formatter: options => `${new Date()} - *SERVER CRASHED DUE TO:*\n\n*uncaught Exception*\n${options.meta.stack}`
    })
  );
}
winston.handleExceptions(exceptionTransports);

winston.exitOnError = false;

winston.info('logger initialized!');
module.exports = winston;


// ensure log directory exist
function createLogDir() {
  const logPath = process.cwd() + config.logs.dir;
  fs.existsSync(logPath) || fs.mkdirSync(logPath);
  return config.logs.dir;
}
