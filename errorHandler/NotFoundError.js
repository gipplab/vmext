"use strict";

module.exports = function NotFoundError(msg) {
    Error.captureStackTrace(this, this.constructor);
    this.name = "NotFoundError";
    this.message = msg;
    this.status = 404;
};

require('util').inherits(module.exports, Error);