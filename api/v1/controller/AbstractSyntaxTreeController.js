'use strict';

const ASTParser = require('lib/ASTParser');
const ASTRenderer = require('lib/ASTRenderer');
const MathJaxRenderer = require('lib/MathJaxRenderer');
const SnapRenderer = require('lib/ASTRenderer/SnapRenderer');
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

    parsedMathMLPromise.then((ast) => {
      const source = req.query.formulaidentifier || 'A';

      Promise.all([
        new ASTRenderer.Graph(ast).renderSingleTree(source),
        MathJaxRenderer.renderMML(req.body.mathml),
      ])
      .then(([cytoscapedAST, mathjaxSVG]) => {
        res.format({
          'application/json': () => {
            if (req.query.cytoscaped === 'true') {
              res.json({
                formulaSVG: `${querystring.escape(mathjaxSVG)}`,
                cytoscapedAST,
              });
            } else res.json(ast);
          },
          'image/png': () => {
            (new SnapRenderer())
              .renderSingleTree(cytoscapedAST, res.locals.width, res.locals.height)
              .then((tmpFilename) => {
                res.sendFile(tmpFilename);
              })
              .catch(err => next(Boom.badImplementation(err)));
          },
          default: () => {
            return next(Boom.notAcceptable('Request needs to accept application/json or image/svg+xml'));
          }
        });
      }).catch(e => next(Boom.badData(e)));
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
      ])
      .then(([cytoscapedAST, mathjaxSVG]) => {
        res.json({
          formulaSVG: `${querystring.escape(mathjaxSVG)}`,
          cytoscapedAST,
        });
      })
      .catch(e => next(Boom.badData(e)));
    });
  }

  static renderMergedAst(req, res, next) {
    Promise.all([
      (new ASTParser(res.locals.reference_mathml)).parse(),
      (new ASTParser(res.locals.comparison_mathml)).parse()
    ]).then(([referenceAST, comparisonAST]) => {
      return Promise.all([
        new ASTRenderer.Graph(referenceAST).renderSingleTree('A'),
        new ASTRenderer.Graph(comparisonAST).renderSingleTree('B'),
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
        'image/png': () => {
          (new SnapRenderer())
          .renderMergedTree(cytoscapedMergedAST, res.locals.width, res.locals.height)
          .then((tmpFilename) => {
            res.sendFile(tmpFilename);
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
