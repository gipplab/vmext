'use strict';

const path = require('path'),
      xmlParser = require(path.join(process.cwd(), 'lib', 'xmlParser')),
      BadRequestError = require(path.join(process.cwd(), 'errorHandler', 'BadRequestError')),
      ConflictError = require(path.join(process.cwd(), 'errorHandler', 'ConflictError'));

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    if (!req.body) return next(new BadRequestError("request body is empty or not application/json encoded!"));
    xmlParser.parseXML(req.body.mathml, (err, result) => {
      if (err) return next(new ConflictError('XML- Parsing Error'));
      res.json(result);
    });
  }
};
