"use strict";

module.exports = function NotAcceptableError(msg) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = msg;
    this.status = 406;
};

require('util').inherits(module.exports, Error);
