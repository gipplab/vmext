'use strict';

const path = require('path'),
      xmlParser = require(path.join(process.cwd(), 'lib', 'MathMLParser')),
      SVGRenderer = require(path.join(process.cwd(), 'lib', 'SVGRenderer')),
      BadRequestError = require(path.join(process.cwd(), 'errorHandler', 'BadRequestError')),
      NotAcceptableError = require(path.join(process.cwd(), 'errorHandler', 'NotAcceptableError'));

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    if (!req.body.mathml) return next(new BadRequestError("form-data is missing field: mathml!"));

    (new xmlParser(req.body.mathml)).parse((err, result) => {
      if (err) return next(err);
      if (req.accepts('image/svg+xml')) {
        SVGRenderer.renderSVG(result, (svg) => {
          res.send(svg);
        });
      } else if(req.accepts('application/json')){
        res.json(result);
      } else return next(new NotAcceptableError(`Request needs to accept application/json or image/svg+xml`));
    });
  }
};
