'use strict';

const express = require('express');
const astRouter = module.exports = express.Router({ mergeParams: true });
const multer = require('multer');
const upload = multer();
const RequestValidator = require('lib/RequestValidator');
const astController = require('../controller/AbstractSyntaxTreeController');

/**
   * @api {post} /api/v1/math/renderAST POST /api/v1/math/renderAST
   * @apiParam (Headers) {String} Accept type of result<br/>[application/json | image/svg+xml]
   * @apiParam (Query) {Boolean} [cytoscaped] if set to true in combination with Accept: application/json returns json prepared for cytoscape
   * @apiParam (Query) {Boolean} [formulaidentifier] defines prefix of cytoscaped node id's and suffix of cytoscpaped node classes<br/>only required in combination with similarities-widget<br/>defaults to 'A'
   * @apiParam (Body (multipart/form-data)) {XML} mathml the mathML to be rendered into an AST
   * @apiParam (Body (multipart/form-data)) {Boolean} [renderFormula] flag wether entire formula should be rendered to the top of the AST. <br>Defaults to false //eslint-disable-line max-len
   * @apiParam (Body (multipart/form-data)) {Boolean} [collapseSingleOperandNodes] flag wether nodes with only one child should be collapsed <br>Defaults to true
   * @apiParam (Body (multipart/form-data)) {JSON} [nodesToBeCollapsed] ids of apply nodes to be collapsed <br> Example: ["p1.1.m1.1.4.1.cmml", "p1.1.m1.1.3.3.7.1.cmml"]
   * @apiName RenderAst
   * @apiGroup Math
   * @apiDescription Renders an abstract syntax tree based on provided mathML
   * @apiSuccess (Success 200) svg abstract syntax tree
   */
astRouter.post('/renderAST',
                upload.none(),
                RequestValidator.contentType('multipart/form-data'),
                RequestValidator.parseParams(
                  [{
                    name: 'mathml',
                    origin: 'BODY',
                    type: 'xml',
                    optional: false
                  },
                  {
                    name: 'collapseSingleOperandNodes',
                    origin: 'BODY',
                    type: 'boolean',
                    optional: true,
                    default: false
                  },
                  {
                    name: 'nodesToBeCollapsed',
                    origin: 'BODY',
                    type: 'json',
                    optional: true,
                    default: []
                  },
                  {
                    name: 'renderFormula',
                    origin: 'BODY',
                    type: 'boolean',
                    optional: true,
                    default: true
                  }]),
                astController.renderAst);

/**
   * @api {post} /api/v1/math/renderMergedAST POST /api/v1/math/renderMergedAST
   * @apiParam (Headers) {String} Accept type of result<br/>application/json
   * @apiParam (Body (multipart/form-data)) {XML} reference_mathml the mathML of reference document
   * @apiParam (Body (multipart/form-data)) {XML} comparison_mathml the mathML of comparison document
   * @apiParam (Body (multipart/form-data)) {JSON} similaries the JSON containing match information
   * @apiName RenderMergedAst
   * @apiGroup Math
   * @apiDescription Renders a merged AST
   * @apiSuccess (Success 200) svg merged abstract syntax tree
   */
astRouter.post('/renderMergedAST',
                upload.none(),
                RequestValidator.contentType('multipart/form-data'),
                RequestValidator.parseParams(
                  [{
                    name: 'reference_mathml',
                    origin: 'BODY',
                    type: 'xml',
                    optional: false
                  },
                  {
                    name: 'comparison_mathml',
                    origin: 'BODY',
                    type: 'xml',
                    optional: false
                  },
                  {
                    name: 'similarities',
                    origin: 'BODY',
                    type: 'json',
                    optional: false
                  }]),
                astController.renderMergedAst);

/**
   * @api {post} /api/v1/math/renderPMML POST /api/v1/math/renderPMML
   * @apiParam (Body (multipart/form-data)) {XML} mathml the presentation-MathML to be rendered
   * @apiName RenderFormula
   * @apiGroup Math
   * @apiDescription Renders presentation-MathML into SVG (Do not enclose <math></math>)
   * @apiSuccess (Success 200) {svg} svg rendered formula
   */
astRouter.post('/renderPMML',
                upload.none(),
                RequestValidator.contentType('multipart/form-data'),
                RequestValidator.parseParams(
                  [{
                    name: 'mathml',
                    origin: 'BODY',
                    type: 'string',
                    optional: false
                  }]),
                 astController.renderMML);
