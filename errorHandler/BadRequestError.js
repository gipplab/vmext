"use strict";

module.exports = function BadRequestError(msg) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = msg;
    this.status = 400;
};

require('util').inherits(module.exports, Error);