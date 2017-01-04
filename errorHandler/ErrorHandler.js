'use strict';

const log = require('app/lib/logger');
const NotFoundError = require('./NotFoundError.js');

module.exports = (app) => {
  // catch 404s
  app.use((req, res, next) => {
    next(new NotFoundError(`Endpoint ${req.originalUrl} for method ${req.method} is not defined.`));
  });

  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    log.error(err);
    // res.status(err.status || 500).json({
    //   Error: {
    //     name: err.name,
    //     status: err.status || 500,
    //     message: err.message,
    //     stack: app.get('env') === 'production' ? null : err.stack
    //   }
    // });
    res.status(err.status || 500).json({ Error: err });
  });
};
