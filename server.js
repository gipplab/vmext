'use strict';

// register project root to global require calls
require('app-module-path/register');

const express = require('express');
const app = module.exports = express();
// const config = require('./config/config');
// const swaggerJSDoc = require('swagger-jsdoc');
const compression = require('compression');
const favicon = require('serve-favicon');
const log = require('./lib/logger');
const readGlob = require('read-glob-promise');
const CircularJSON = require('circular-json');


// swagger definition
// const swaggerDefinition = {
//   info: {
//     title: 'API Documentation',
//     version: '1.0.0',
//     description: 'Docs for formula-AST rendering API',
//   },
//   host: config.host,
//   basePath: '/',
// };

// initialize swagger-jsdoc
// const swaggerSpec = swaggerJSDoc({
//   swaggerDefinition,
//   apis: ['./api/v1/routes/*.js'],
// });


app.use(favicon(__dirname + '/frontend/favicon.ico'));
// compress all assets and json-responses if minimal size is reached
app.use(compression());

readGlob('data/*.mml.xml', 'utf8')
  .then((contents) => {
    app.locals.mml  = contents;
  });
readGlob('data/*sim.json', 'utf8')
  .then((contents) => {
    app.locals.sim  = contents;
  });
// Allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static('./public'));
// expose routes for templates
app.use('/', require('./routes/routes'));
// expose api
app.use('/api', require('./api/versions'));
// expose api docs
app.use('/api/docs', express.static('./config/apiDoc'));

// serve swagger
// app.get('/swagger.json', (req, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   res.send(swaggerSpec);
// });

// global errorHandler ============================================
require('./errorHandler/ErrorHandler')(app);

// set up server ==================================================
function start() {
  return app.listen(process.env.PORT || 4001, () => {
    log.info(`server started, listening on port: ${process.env.PORT || 4001}`);
    process.on('unhandledRejection', (reason) => {
      try{
        log.info(reason.stack);
      } catch (e) {}
      log.info('Unhandled promise rejection. Reason:', CircularJSON.stringify(reason));
    });
  });
}

if (require.main === module) {
  start();
}

module.exports = {
  start,
  app
};
