'use strict';

const path = require('path'),
      xmlParser = require(path.join(process.cwd(), 'lib', 'xmlParser')),
      BadRequestError = require(path.join(process.cwd(), 'errorHandler', 'BadRequestError'));

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    if (!req.body.mathml) return next(new BadRequestError("form-data is missing field: mathml!"));

    (new xmlParser(req.body.mathml)).parse((err, result) => {
      if (err) return next(err);
      res.json(result);
    });
  }
};
