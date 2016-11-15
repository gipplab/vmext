'use strict';

const path = require('path'),
      xmlParser = require(path.join(process.cwd(), 'lib', 'MathMLParser')),
      SVGRenderer = require(path.join(process.cwd(), 'lib', 'SVGRenderer')),
      MathJaxRenderer = require(path.join(process.cwd(), 'lib', 'MathJaxRenderer')),

      BadRequestError = require(path.join(process.cwd(), 'errorHandler', 'BadRequestError')),
      NotAcceptableError = require(path.join(process.cwd(), 'errorHandler', 'NotAcceptableError'));



module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    if (!req.body.mathml) return next(new BadRequestError("form-data is missing field: mathml!"));

    (new xmlParser(req.body.mathml)).parse((err, result) => {
      if (err) return next(err);
      if (req.body.type === 'svg'){
        SVGRenderer.renderSVG(result, (svg) => {
          res.send(svg);
        });
      } else if(req.body.type === 'json'){
        res.json(result);
      } else return next(new NotAcceptableError(`Request needs to accept application/json or image/svg+xml`));
    });
  }

  static renderMML(req, res, next) {
    MathJaxRenderer.renderMML(req.body.mml, (err, svg) => {
      res.send(svg);
    });
  }
};
