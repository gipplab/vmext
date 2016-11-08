'use strict';
const express = require('express'),
      path = require('path'),
      app = module.exports = express(),
      compression = require('compression'),
      bodyParser = require('body-parser'),
      winston = require('winston'),
      logger = require('./lib/logger'),
      log_general = winston.loggers.get('general'),

      SVGRenderer = require('./lib/SVGRenderer');

// compress all assets and json-responses if minimal size is reached
app.use(compression());

app.use(bodyParser.urlencoded({extended: false})); // url-form encoded data

app.set('view engine', 'pug');
app.set('views', './public/html');

// serve static content only from 'public' dir
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', require('./api/versions'));

app.get('/', (req, res, next) => {
  res.render('index');
});

// global errorHandler ============================================
require(path.join(__dirname, 'errorHandler','ErrorHandler'))(app);

// set up server ==================================================
let server = app.listen(process.env.PORT || 4001, () => {
    let host = (server.address().port === 4001)? 'localhost' : server.address().address;
    log_general.info(`server started, listening on ${host}:${server.address().port}`);
});
