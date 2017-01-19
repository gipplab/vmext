'use strict';

const fs = require('fs');
const ASTParser = require('app/lib/ASTParser');
const ASTRenderer = require('app/lib/ASTRenderer');
const MathJaxRenderer = require('app/lib/MathJaxRenderer');
const Boom = require('boom');

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    const parsedMathMLPromise = (new ASTParser(res.locals.mathml, {
      collapseSingleOperandNodes: res.locals.collapseSingleOperandNodes,
      nodesToBeCollapsed: res.locals.nodesToBeCollapsed
    })).parse();

    parsedMathMLPromise.catch(err => next(err));

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
        return next(Boom.notAcceptable('Request needs to accept application/json or image/svg+xml'));
      }
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
    }).then((results) => {
      const [cytoscapedReferenceAST, cytoscapedComparisonAST, cytoscapedMergedAST] = results;
      res.format({
        'application/json': () => {
          res.json({
            cytoscapedReferenceAST,
            cytoscapedComparisonAST,
            cytoscapedMergedAST
          });
        },
        'application/javascript': () => {
          fs.readFile(`${__dirname}/../externalAssets/mergedAST.js`, 'utf8', (err, file) => {
            if (err) Boom.wrap(err, 500);
            file = file.replace('REFERENCE_AST_TOKEN', JSON.stringify(cytoscapedReferenceAST));
            file = file.replace('COMPARISON_AST_TOKEN', JSON.stringify(cytoscapedComparisonAST));
            file = file.replace('MERGED_AST_TOKEN', JSON.stringify(cytoscapedMergedAST));
            res.send(file);
          });
        },
        default: () => {
          return next(Boom.notAcceptable('Request needs to accept application/json or application/javascript'));
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
