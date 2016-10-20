"use strict";

module.exports = function UnauthorizedError(msg) {
    Error.captureStackTrace(this, this.constructor);
    this.name = "UnauthorizedError";
    this.message = msg;
    this.status = 401;
};

require('util').inherits(module.exports, Error);