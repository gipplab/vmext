'use strict';

const ASTParser = require('app/lib/ASTParser');
const ASTRenderer = require('app/lib/ASTRenderer');
const MathJaxRenderer = require('app/lib/MathJaxRenderer');
const querystring = require('querystring');
const Boom = require('boom');

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    const parsedMathMLPromise = new ASTParser(res.locals.mathml,
      {
        collapseSingleOperandNodes: res.locals.collapseSingleOperandNodes,
        nodesToBeCollapsed: res.locals.nodesToBeCollapsed,
      })
      .parse()
      .catch(next);

    res.format({
      'application/json': () => {
        parsedMathMLPromise.then((ast) => {
          if (req.query.cytoscaped) {
            Promise.all([
              new ASTRenderer.Graph(ast).renderSingleTree(),
              MathJaxRenderer.renderMML(req.body.mathml),
            ]).then(([cytoscapedAST, mathjaxSVG]) => {
              res.json({
                formulaSVG: `${querystring.escape(mathjaxSVG)}`,
                cytoscapedAST,
              });
            });
          } else res.json(ast);
        });
      },
      'image/svg+xml': () => {
        parsedMathMLPromise.then((result) => {
          new ASTRenderer.Simple().render({
            data: result,
            renderFormula: res.locals.renderFormula
          }).then(svg => res.send(svg));
        });
      },
      default: () => {
        return next(Boom.notAcceptable('Request needs to accept application/json or image/svg+xml'));
      },
    });
  }

  static renderMergedAst(req, res, next) {
    Promise.all([
      (new ASTParser(res.locals.reference_mathml)).parse(),
      (new ASTParser(res.locals.comparison_mathml)).parse()
    ]).then(([referenceAST, comparisonAST]) => {
      return Promise.all([
        new ASTRenderer.Graph(referenceAST).renderSingleTree(),
        new ASTRenderer.Graph(comparisonAST).renderSingleTree(),
        new ASTRenderer.Graph(referenceAST, comparisonAST, res.locals.similarities).render(),
      ]);
    }).then(([cytoscapedReferenceAST, cytoscapedComparisonAST, cytoscapedMergedAST]) => {
      res.format({
        'application/json': () => {
          res.json({
            cytoscapedReferenceAST,
            cytoscapedComparisonAST,
            cytoscapedMergedAST
          });
        },
        default: () => {
          return next(Boom.notAcceptable('Request needs to accept application/json'));
        }
      });
    })
    .catch(err => next(err));
  }

  static renderMML(req, res, next) {
    MathJaxRenderer.renderMML(req.body.mathml).then((svg) => {
      res.send(svg);
    })
    .catch(err => next(err));
  }
};
