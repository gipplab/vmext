'use strict';

const log = require('lib/logger');
const Boom = require('boom');

module.exports = (app) => {
  // catch 404s
  app.use((req, res, next) => {
    next(Boom.notFound(`Endpoint ${req.originalUrl} for method ${req.method} is not defined.`));
  });

  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    log.error(err);
    const BoomError = !err.isBoom ? Boom.wrap(err) : err;
    if (res.headersSent) {
      app.log('Skip error handler.');
      return next(err);
    }
    res.status(BoomError.output.statusCode || 500);
    if (!req.accepts('json')) {
      // res.set('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(BoomError.output.payload));
    } else {
      res.json(BoomError.output.payload);
    }
  });
};
