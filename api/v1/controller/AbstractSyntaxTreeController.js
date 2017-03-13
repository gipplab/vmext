'use strict';

const ASTParser = require('lib/ASTParser');
const ASTRenderer = require('lib/ASTRenderer');
const MathJaxRenderer = require('lib/MathJaxRenderer');
const querystring = require('querystring');
const Boom = require('boom');

module.exports = class AbstractSyntaxTreeController {
  static renderAST(req, res, next) {
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
          res.json(ast);
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

  static renderCytoscapedAST(req, res, next) {
    const source = req.query.formulaidentifier || 'A';
    const parsedMathMLPromise = new ASTParser(res.locals.mathml,
      {
        collapseSingleOperandNodes: res.locals.collapseSingleOperandNodes,
        nodesToBeCollapsed: res.locals.nodesToBeCollapsed,
      })
      .parse()
      .catch(next);

    parsedMathMLPromise.then((ast) => {
      Promise.all([
        new ASTRenderer.Graph(ast).renderSingleTree(source),
        MathJaxRenderer.renderMML(req.body.mathml),
      ]).then(([cytoscapedAST, mathjaxSVG]) => {
        res.json({
          formulaSVG: `${querystring.escape(mathjaxSVG)}`,
          cytoscapedAST,
        });
      });
    });
  }

  static renderMergedAst(req, res, next) {
    Promise.all([
      (new ASTParser(res.locals.reference_mathml)).parse(),
      (new ASTParser(res.locals.comparison_mathml)).parse()
    ]).then(([referenceAST, comparisonAST]) => {
      return new ASTRenderer.Graph(referenceAST, comparisonAST, res.locals.similarities).render();
    }).then((cytoscapedMergedAST) => {
      res.format({
        'application/json': () => {
          res.json({
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
