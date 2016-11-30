'use strict';
const MathMLParser = require('app/lib/MathMLParser');
const SVGRenderer = require('app/lib/SVGRenderer');
const MathJaxRenderer = require('app/lib/MathJaxRenderer');
const BadRequestError = require('app/errorHandler/BadRequestError');
const NotAcceptableError = require('app/errorHandler/NotAcceptableError');

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    if (!req.body.mathml) return next(new BadRequestError('form-data is missing field: mathml!'));

    (new MathMLParser(req.body.mathml)).parse((err, result) => {
      if (err) return next(err);
      if (req.body.type === 'svg') {
        SVGRenderer.renderSVG(result, (svg) => {
          res.send(svg);
        });
      } else if (req.body.type === 'json') {
        res.json(result);
      } else return next(new NotAcceptableError('Request needs to accept application/json or image/svg+xml'));
    });
  }

  static renderMML(req, res, next) {
    MathJaxRenderer.renderMML(req.body.mml, (err, svg) => {
      res.send(svg);
    });
  }
};
