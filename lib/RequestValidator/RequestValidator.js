'use strict';

const path = require('path');
const BadRequestError = require('app/errorHandler/BadRequestError');

module.exports = class RequestValidator {
  static multiPartFormData(req, res, next) {
    if (req.headers['content-length'] === 0 || req.headers['content-type'].indexOf('multipart/form-data') < 0) {
      return next(new BadRequestError('request body is empty or not multipart/form-data encoded!'));
    }
    next();
  }
};
