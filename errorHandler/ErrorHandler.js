const   path = require('path'),
        winston = require('winston'),
        NotFoundError = require(path.join(__dirname, 'NotFoundError.js')),
        log_errors = winston.loggers.get('errors');

module.exports = (app) => {

    // catch 404 and forward to error handler
    // since this is the last middleware attached to the app (except the two error handlers) it will catch all
    // requests that did't match anything else yet
    app.use(function(req, res, next) {
        next(new NotFoundError(`Endpoint ${req.originalUrl} for method ${req.method} is not defined.`));
    });

    // production errors: no stackTraces leaked to user
    if (app.get('env') === 'production') {
        app.use(function(err, req, res, next) {
            const error = {
                    name: err.name,
                    message: err.message,
                    status: err.status || 500
            }
            log_errors.error(error);
            res.status(error.status).json({error: error});
        });
    } else {
        // development errors: print stacktrace
        app.use(function(err, req, res, next) {
            const error = {
              name: err.name,
              message: err.message,
              status: err.status || 500,
              stack: err.stack
            }
            log_errors.error(error);
            res.status(error.status).json({error: error});
        });
    }


};
