'use strict';

const path = require('path'),
      BadRequestError = require(path.join(process.cwd(), 'errorHandler', 'BadRequestError')),
      ConflictError = require(path.join(process.cwd(), 'errorHandler', 'ConflictError'));

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    if (!req.body) return next(new BadRequestError("request body is empty or not application/json encoded!"));
    console.log(req.query);
    res.send(req.body);
  }
};
