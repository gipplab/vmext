"use strict";

module.exports = function ConflictError(msg) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = msg;
    this.status = 409;
};

require('util').inherits(module.exports, Error);