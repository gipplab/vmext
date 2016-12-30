'use strict';

const BadRequestError = require('app/errorHandler/BadRequestError');
const TypeParsingMap = require('./TypeParsingMap');

module.exports = class RequestValidator {
  static contentType(type) {
    return function (req, res, next) {
      if (req.headers['content-length'] === 0 || req.headers['content-type'].indexOf(type) < 0) {
        return next(new BadRequestError(`request body is empty or not ${type} encoded!`));
      }
      next();
    };
  }

  static parseParams(params) {
    return function (req, res, next) {
      for (const param of params) {
        if (req.body[param.name]) {
          try {
            res.locals[param.name] = TypeParsingMap[param.type](req.body[param.name]);
          } catch (e) {
            return next(new BadRequestError(`${param.name} must be of type ${param.type}`));
          }
        } else if (!param.optional) {
          return next(new BadRequestError(`form-data is missing field: ${param.name}`));
        }
      }
      next();
    };
  }

};
