'use strict';

const path = require('path'),
      BadRequestError = require(path.join(process.cwd(), 'errorHandler', 'BadRequestError'));

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    if (!req.body.data) return next(new BadRequestError("request body is empty or not application/json encoded!"));
    if (!req.query.type) return next(new BadRequestError(`Query parameter: "type" is empty or not in [svg | pdf]`));
    res.json(req.get('Accept'));
  }
};
