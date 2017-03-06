'use strict';

const express = require('express');
const astRouter = module.exports = express.Router({ mergeParams: true });
const multer = require('multer');
const upload = multer();
const RequestValidator = require('lib/RequestValidator');
const astController = require('../controller/AbstractSyntaxTreeController');

/**
* @swagger
* /api/v1/math/renderAST:
*   post:
*     tags:
*       - Math
*     description: Renders an abstract syntax tree based on provided mathML
*     consumes:
*       - multipart/form-data
*     produces:
*       - application/json
*       - image/svg+xml
*     parameters:
*       - name: Accept
*         description: declaring content type
*         in: header
*         required: false
*         type: string
*         default: application/json
*       - name: mathml
*         description: the mathML to be rendered into an AST
*         in: formData
*         required: true
*         type: application/xml
*       - name: collapseSingleOperandNodes
*         description: flag wether nodes with only one child should be collapsed </br> Defaults to true
*         in: formData
*         required: false
*         type: boolean
*         default: false
*       - name: nodesToBeCollapsed
*         description: ids of apply nodes to be collapsed </br> Example ["p1.1.m1.1.4.1.cmml", "p1.1.m1.1.3.3.7.1.cmml"]
*         in: formData
*         required: false
*         type: array
*         default: [""]
*       - name: cytoscaped
*         description: if set to true in combination with (Accept application/json) returns json prepared for cytoscape
*         in: query
*         required: false
*         type: boolean
*         default: false
*       - name: formulaidentifier
*         description: defines prefix of cytoscaped node id's and suffix of cytoscpaped node classes (only required in combination with similarities-widget)
*         in: query
*         required: false
*         type: string
*         default: A
*     responses:
*       200:
*         description: abstract syntax tree
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
* @swagger
* /api/v1/math/renderMergedAST:
*   post:
*     tags:
*       - Math
*     description: Renders a merged AST
*     consumes:
*       - multipart/form-data
*     produces:
*       - application/json
*       - image/svg+xml
*     parameters:
*       - name: Accept
*         description: declaring content type
*         in: header
*         required: false
*         type: string
*         default: application/json
*       - name: reference_mathml
*         description: the mathML of reference document
*         in: formData
*         required: true
*         type: application/xml
*       - name: comparison_mathml
*         description: the mathML of comparison document
*         in: formData
*         required: true
*         type: application/xml
*       - name: similarities
*         description: the JSON containing match information
*         in: formData
*         required: true
*         type: application/json
*     responses:
*       200:
*         description: merged abstract syntax tree
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
