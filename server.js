'use strict';

// register project root to global require calls
require('app-module-path/register');

const express = require('express');
const app = module.exports = express();
const swaggerJSDoc = require('swagger-jsdoc');
const compression = require('compression');
const favicon = require('serve-favicon');
const log = require('./lib/logger');

// swagger definition
const swaggerDefinition = {
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Docs for formula-AST rendering API',
  },
  host: 'localhost:4001',
  basePath: '/',
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: ['./api/v1/routes/*.js'],
});


app.use(favicon(__dirname + '/public/favicon.ico'));
// compress all assets and json-responses if minimal size is reached
app.use(compression());

app.set('view engine', 'pug');
app.set('views', './public/html');

// Allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// serve static content only from 'public' dir
app.use(express.static('./public'));
// expose routes for templates
app.use('/', require('./routes/routes'));
// expose api
app.use('/api', require('./api/versions'));
// expose api docs
app.use('/api/docs', express.static('./config/apiDoc'));

// serve swagger
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// global errorHandler ============================================
require('./errorHandler/ErrorHandler')(app);

// set up server ==================================================
const server = app.listen(process.env.PORT || 4001, () => {
  log.info(`server started, listening on port: ${server.address().port}`);
});
