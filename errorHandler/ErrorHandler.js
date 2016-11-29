'use strict';
const log = require('../lib/logger');
const NotFoundError = require('./NotFoundError.js');

module.exports = (app) => {
  // catch 404s
  app.use((req, res, next) => {
    next(new NotFoundError(`Endpoint ${req.originalUrl} for method ${req.method} is not defined.`));
  });

  app.use((err, req, res, next) => {
    log.error(err);
    res.status(err.status).json({
      Error: {
        name: err.name,
        status: err.status,
        message: err.message,
        stack: app.get('env') === 'production' ? null : err.stack
      }
    });
  });
};
