'use strict';

const express = require('express');
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
app.use(express.static('./public'));
// expose routes for templates
app.use('/', require('./routes/routes'));
// expose api
app.use('/api', require('./api/versions'));
// expose api docs
app.use('/api/docs', express.static('./config/apiDoc'));

// global errorHandler ============================================
require('./errorHandler/ErrorHandler')(app);

// set up server ==================================================
const server = app.listen(process.env.PORT || 4001, () => {
  log.info(`server started, listening on port: ${server.address().port}`);
});
