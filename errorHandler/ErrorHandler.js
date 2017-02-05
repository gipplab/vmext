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
    res.status(BoomError.output.statusCode || 500).json({ Error: BoomError });
  });
};
