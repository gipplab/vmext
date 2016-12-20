'use strict';

const MathMLParser = require('app/lib/MathMLParser');
const ASTRenderer = require('app/lib/ASTRenderer');
const MathJaxRenderer = require('app/lib/MathJaxRenderer');
const ASTMerger = require('app/lib/ASTMerger');
const BadRequestError = require('app/errorHandler/BadRequestError');
const NotAcceptableError = require('app/errorHandler/NotAcceptableError');

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    if (!req.body.mathml) return next(new BadRequestError('form-data is missing field: mathml!'));
    const parsedMathMLPromise = (new MathMLParser(req.body.mathml, {
      collapseSingleOperandNodes: JSON.parse(req.body.collapseSingleOperandNodes)
    })).parse();

    res.format({
      'application/json': () => {
        parsedMathMLPromise.then((result) => {
          res.json(result);
        });
      },
      'image/svg+xml': () => {
        parsedMathMLPromise.then((result) => {
          ASTRenderer.renderSVG({
            data: result,
            renderFormula: JSON.parse(req.body.renderFormula)
          }, (svgErr, svg) => {
            if (svgErr) return next(svgErr);
            res.send(svg);
          });
        });
      },
      default: () => {
        return next(new NotAcceptableError('Request needs to accept application/json or image/svg+xml'));
      }
    });
  }

  static renderMergedAst(req, res, next) {
    if (!req.body.reference_mathml) return next(new BadRequestError('form-data is missing field: reference_mathml!'));
    if (!req.body.comparison_mathml) return next(new BadRequestError('form-data is missing field: comparison_mathml!'));
    if (!req.body.similarities) return next(new BadRequestError('form-data is missing field: similarities!'));
    new ASTMerger(
      req.body.reference_mathml,
      req.body.comparison_mathml,
      JSON.parse(req.body.similarities))
      .merge().then((result) => {
        res.send(result);
      }
    );
  }

  static renderMML(req, res, next) {
    MathJaxRenderer.renderMML(req.body.mathml, (err, svg) => {
      if (err) return next(err);
      res.send(svg);
    });
  }
};
