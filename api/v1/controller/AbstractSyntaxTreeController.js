'use strict';

const ASTParser = require('lib/ASTParser');
const ASTRenderer = require('lib/ASTRenderer');
const MathJaxRenderer = require('lib/MathJaxRenderer');
const SnapRenderer = require('lib/ASTRenderer/SnapRenderer');
const querystring = require('querystring');
const Boom = require('boom');


module.exports = {
  parseAST: (req, res, next) => {
    return new ASTParser(res.locals.mathml,
      {
        collapseSingleOperandNodes: res.locals.collapseSingleOperandNodes,
        nodesToBeCollapsed: res.locals.nodesToBeCollapsed
      })
      .parse()
      .then((ast) => {
        res.json(ast);
      })
      .catch((err) => { next(Boom.badData(err.message, res.locals.mathml.toLocaleString())); });
  },

  parseCytoscapedAST: (req, res, next) => {
    const source = req.query.formulaidentifier || 'A';
    new ASTParser(res.locals.mathml,
      {
        collapseSingleOperandNodes: res.locals.collapseSingleOperandNodes,
        nodesToBeCollapsed: res.locals.nodesToBeCollapsed
      })
      .parse()
      .catch((err) => {
        next(Boom.badData(err.message));
        throw err;
      })
      .then((ast) => {
        const graph = new ASTRenderer.Graph(ast);
        const singleTree = graph.renderSingleTree(source)
          .catch(err =>
            next(err,req,res,next));
        const renderMML = MathJaxRenderer.renderMML(ast.presentation)
          .catch(err =>
            next(err,req,res,next)
          );
        Promise.all([
          singleTree,
          renderMML
        ])
          .then(([cytoscapedAST, mathjaxSVG]) => {
            res.json({
              formulaSVG: `${querystring.escape(mathjaxSVG.svg)}`,
              cytoscapedAST
            });
          });
      })
      .catch(err => next(Boom.badImplementation(err)));

  },

  renderAST: (req, res, next) => {
    const astParser = new ASTParser(res.locals.mathml,
      {
        collapseSingleOperandNodes: res.locals.collapseSingleOperandNodes,
        nodesToBeCollapsed: res.locals.nodesToBeCollapsed
      });
    return astParser
      .parse()
      .then((ast) => {
        const source = req.query.formulaidentifier || 'A';
        const singleTree = new ASTRenderer.Graph(ast).renderSingleTree(source);
        singleTree.catch(err => next(Boom.badImplementation(err)));
        return Promise.all([
          singleTree,
          MathJaxRenderer.renderMML(req.body.mathml)
        ]).then(([cytoscapedAST, mathjaxSVG]) => {
          return (new SnapRenderer())
            .renderSingleTree(cytoscapedAST.svg, res.locals.width, res.locals.height)
            .then((tmpFilename) => {
              res.sendFile(tmpFilename);
            });
        });
      })
      .catch((err) => {
        next(Boom.badData(err.message, res.locals.mathml.toLocaleString()));
      });
  },

  parseCytoscapedMergedAst:
    (req, res, next) => {
      Promise.all([
        (new ASTParser(res.locals.reference_mathml)).parse(),
        (new ASTParser(res.locals.comparison_mathml)).parse()
      ]).then(([referenceAST, comparisonAST]) => {
        return new ASTRenderer.Graph(referenceAST, comparisonAST, res.locals.similarities).render();
      }).then((cytoscapedMergedAST) => {
        res.json({ cytoscapedMergedAST });
      })
        .catch((err) => { next(Boom.badData(err.message)); });
    },

  renderMergedAst:
    (req, res, next) => {
      Promise.all([
        (new ASTParser(res.locals.reference_mathml)).parse(),
        (new ASTParser(res.locals.comparison_mathml)).parse()
      ]).then(([referenceAST, comparisonAST]) => {
        return (new ASTRenderer.Graph(referenceAST, comparisonAST, res.locals.similarities)).render();
      }).then((cytoscapedMergedAST) => {
        (new SnapRenderer())
          .renderMergedTree(cytoscapedMergedAST, res.locals.width, res.locals.height)
          .then((tmpFilename) => {
            res.sendFile(tmpFilename);
          });
      })
        .catch((err) => { next(Boom.badData(err.message)); });
    },

  renderMML:
    (req, res, next) => {
      MathJaxRenderer.renderMML(req.body.mathml).then((svg) => {
        res.send(svg.svg);
      })
        .catch((err) => { next(Boom.badData(err.message, req.body.mathml.toLocaleString())); });
    }
};
