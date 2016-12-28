'use strict';

const ASTParser = require('app/lib/ASTParser');
const ASTRenderer = require('app/lib/ASTRenderer');
const MathJaxRenderer = require('app/lib/MathJaxRenderer');
const BadRequestError = require('app/errorHandler/BadRequestError');
const NotAcceptableError = require('app/errorHandler/NotAcceptableError');

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    const parsedMathMLPromise = (new ASTParser(res.locals.mathml, {
      collapseSingleOperandNodes: res.locals.collapseSingleOperandNodes
    })).parse();

    res.format({
      'application/json': () => {
        parsedMathMLPromise.then(result => res.json(result));
      },
      'image/svg+xml': () => {
        parsedMathMLPromise.then((result) => {
          new ASTRenderer.Simple().render({
            data: result,
            renderFormula: res.locals.renderFormula
          }).then(svg => res.send(svg)).catch(next);
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
    const similarities = JSON.parse(req.body.similarities);
    const parseTasks = [
      (new ASTParser(req.body.reference_mathml)).parse(),
      (new ASTParser(req.body.comparison_mathml)).parse()
    ];

    Promise.all(parseTasks).then(([a, b]) => {
      const renderer = new ASTRenderer.Graph(a, b, similarities);
      renderer.render().then((elements) => {
        res.send(elements);
      })
      .catch(err => next(err));
    });
  }

  static renderMML(req, res, next) {
    MathJaxRenderer.renderMML(req.body.mathml).then((svg) => {
      res.send(svg);
    })
    .catch(err => next(err));
  }
};
