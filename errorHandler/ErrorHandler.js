'use strict';

const log = require('app/lib/logger');
const Boom = require('boom');

module.exports = (app) => {
  // catch 404s
  app.use((req, res, next) => {
    next(Boom.notFound(`Endpoint ${req.originalUrl} for method ${req.method} is not defined.`));
  });

  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    log.error(err);
    res.status(err.status || 500).json({ Error: err });
  });
};
