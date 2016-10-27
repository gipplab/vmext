'use strict';
const express = require('express'),
      path = require('path'),
      app = module.exports = express(),
      compression = require('compression'),
      bodyParser = require('body-parser'),
      winston = require('winston'),
      logger = require('./lib/logger'),
      log_general = winston.loggers.get('general');

// compress all assets and json-responses if minimal size is reached
app.use(compression());

app.use(bodyParser.urlencoded({extended: false})); // url-form encoded data

// serve static content only from 'public' dir
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', require('./api/routes/publicAPIRoutes'));

// global errorHandler ============================================
require(path.join(__dirname, 'errorHandler','ErrorHandler'))(app);

// set up server ==================================================
let server = app.listen(process.env.PORT || 4001, () => {
    let host = (server.address().port === 4001)? 'localhost' : server.address().address;
    log_general.info(`server started, listening on ${host}:${server.address().port}`);
});
