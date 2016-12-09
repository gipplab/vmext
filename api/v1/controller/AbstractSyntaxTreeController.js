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
      if (req.accepts('svg')) {
        SVGRenderer.renderSVG({
          data: result,
          renderFormula: JSON.parse(req.headers.renderformula)
        }, (svgErr, svg) => {
          if (svgErr) return next(err);
          res.send(svg);
        });
      } else if (req.accepts('json')) {
        res.json(result);
      } else return next(new NotAcceptableError('Request needs to accept application/json or image/svg+xml'));
    });
  }

  static renderMergedAst(req, res, next) {
    if (!req.body.reference_mathml) return next(new BadRequestError('form-data is missing field: reference_mathml!'));
    if (!req.body.comparison_mathml) return next(new BadRequestError('form-data is missing field: comparison_mathml!'));
    if (!req.body.similarity_xml) return next(new BadRequestError('form-data is missing field: similarity_xml!'));
  }
  static renderMML(req, res, next) {
    MathJaxRenderer.renderMML(req.body.mathml, (err, svg) => {
      if (err) return next(err);
      res.send(svg);
    });
  }
};
