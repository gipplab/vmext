'use strict';
const http = require('http');

module.exports = function UnauthorizedError(msg) {
  Error.captureStackTrace(this, this.constructor);
  this.status = 401;
  this.name = http.STATUS_CODES[this.status];
  this.message = msg;
};

require('util').inherits(module.exports, Error);
