const path = require('path');
const log = require('../lib/logger');
const NotFoundError = require(path.join(__dirname, 'NotFoundError.js'));

module.exports = (app) => {
  // catch 404s
  app.use((req, res, next) => {
    next(new NotFoundError(`Endpoint ${req.originalUrl} for method ${req.method} is not defined.`));
  });

  // production errors: no stackTraces leaked to user
  if (app.get('env') === 'production') {
    app.use((err, req, res, next) => {
      const error = {
        name: err.name,
        message: err.message,
        status: err.status || 500
      };
      log.error(error);
      res.status(error.status).json({ error });
    });
  } else {
    // development errors: print stacktrace
    app.use((err, req, res, next) => {
      const error = {
        name: err.name,
        message: err.message,
        status: err.status || 500,
        stack: err.stack
      };
      log.error(error);
      res.status(error.status).json({ error });
    });
  }
};
