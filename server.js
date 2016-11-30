'use strict';
const express = require('express');
const path = require('path');
const app = module.exports = express();
const compression = require('compression');
const bodyParser = require('body-parser');
const log = require('./lib/logger');

// compress all assets and json-responses if minimal size is reached
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'pug');
app.set('views', './public/html');

// serve static content only from 'public' dir
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', require('./api/versions'));
app.use('/api/docs', express.static(path.join(__dirname, 'config', 'apiDoc')));

app.get('/', (req, res, next) => {
  res.render('index');
});

// global errorHandler ============================================
require(path.join(__dirname, 'errorHandler', 'ErrorHandler'))(app);

// set up server ==================================================
let server = app.listen(process.env.PORT || 4001, () => {
  log.info(`server started, listening on port: ${server.address().port}`);
});
