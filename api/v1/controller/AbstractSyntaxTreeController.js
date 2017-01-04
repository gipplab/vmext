'use strict';

const fs = require('fs');
const ASTParser = require('app/lib/ASTParser');
const ASTRenderer = require('app/lib/ASTRenderer');
const MathJaxRenderer = require('app/lib/MathJaxRenderer');
const NotAcceptableError = require('app/errorHandler/NotAcceptableError');
const mergedASTJavascript = fs.readFileSync(`${__dirname}/../externalAssets/mergedAST.js`, 'utf8');

module.exports = class AbstractSyntaxTreeController {
  static renderAst(req, res, next) {
    const parsedMathMLPromise = (new ASTParser(res.locals.mathml, {
      collapseSingleOperandNodes: res.locals.collapseSingleOperandNodes,
      nodesToBeCollapsed: res.locals.nodesToBeCollapsed
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
    const parseTasks = [
      (new ASTParser(res.locals.reference_mathml)).parse(),
      (new ASTParser(res.locals.comparison_mathml)).parse()
    ];

    res.format({
      'application/json': () => {
        Promise.all(parseTasks).then(([a, b]) => {
          const renderer = new ASTRenderer.Graph(a, b, res.locals.similarities);
          renderer.render()
                  .then(elements => res.send(elements))
                  .catch(next);
        });
      },
      'application/javascript': () => {
        res.send(mergedASTJavascript);
      },
      default: () => {
        return next(new NotAcceptableError('Request needs to accept application/json or application/javascript'));
      }
    });
  }

  static renderMML(req, res, next) {
    MathJaxRenderer.renderMML(req.body.mathml).then((svg) => {
      res.send(svg);
    })
    .catch(err => next(err));
  }
};
