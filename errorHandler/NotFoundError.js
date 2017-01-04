'use strict';

const http = require('http');

module.exports = function NotFoundError(msg) {
  Error.captureStackTrace(this, this.constructor);
  this.status = 404;
  this.name = http.STATUS_CODES[this.status];
  this.message = msg;
};

require('util').inherits(module.exports, Error);
