'use strict';

const express = require('express');
const astRouter = module.exports = express.Router({ mergeParams: true });
const multer = require('multer');
const upload = multer();
const RequestValidator = require('lib/RequestValidator');
const astController = require('../controller/AbstractSyntaxTreeController');

/**
* @swagger
* definitions:
*   cytoscaped:
*     type: array
*     items:
*       type: object
*       properties:
*         data:
*           type: object
*         position:
*           type: object
*         group:
*           type: string
*         removed:
*           type: boolean
*         selected:
*           type: boolean
*         selectable:
*           type: boolean
*         locked:
*           type: boolean
*         grabbable:
*           type: boolean
*         classes:
*           type: string
*/

/**
* @swagger
* /api/v1/math/parseAST:
*   post:
*     tags:
*       - Math
*     description: Returns an Abstract Syntax Tree based on provided MathML
*     consumes:
*       - multipart/form-data
*     produces:
*       - application/json
*     parameters:
*       - name: mathml
*         description: the mathML to be parsed into an AST
*         in: formData
*         required: true
*         type: string
*       - name: collapseSingleOperandNodes
*         description: flag wether nodes with only one child should be collapsed
*         in: formData
*         required: false
*         type: boolean
*         default: false
*       - name: nodesToBeCollapsed
*         description: ids of apply nodes to be collapsed </br> Example ["p1.1.m1.1.4.1.cmml", "p1.1.m1.1.3.3.7.1.cmml"]
*         in: formData
*         required: false
*         type: string
*     responses:
*       200:
*         description: abstract syntax tree
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*             presentation:
*               type: string
*             nodePresentation:
*               type: string
*             children:
*               type: object
*/
astRouter.post('/parseAST',
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
                  }]),
                astController.parseAST);

  /**
  * @swagger
  * /api/v1/math/parseCytoscapedAST:
  *   post:
  *     tags:
  *       - Math
  *     description: Returns nodes and edges prepared to be rendered into an AST with cytoscape
  *     consumes:
  *       - multipart/form-data
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: mathml
  *         description: the mathML to be parsed into an AST
  *         in: formData
  *         required: true
  *         type: string
  *       - name: collapseSingleOperandNodes
  *         description: flag wether nodes with only one child should be collapsed
  *         in: formData
  *         required: false
  *         type: boolean
  *         default: false
  *       - name: nodesToBeCollapsed
  *         description: ids of apply nodes to be collapsed </br> Example ["p1.1.m1.1.4.1.cmml", "p1.1.m1.1.3.3.7.1.cmml"]
  *         in: formData
  *         required: false
  *         type: string
  *       - name: formulaidentifier
  *         description: defines prefix of cytoscaped node id's and suffix of cytoscpaped node classes (only required in combination with similarities-widget)
  *         in: query
  *         required: false
  *         type: string
  *         default: A
  *     responses:
  *       200:
  *         description: abstract syntax tree
  *         schema:
  *           type: object
  *           properties:
  *             formulaSVG:
  *               type: string
  *             cytoscapedAST:
  *               $ref: '#/definitions/cytoscaped'
  */
astRouter.post('/parseCytoscapedAST',
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
    }]),
  astController.parseCytoscapedAST);

/**
  * @swagger
  * /api/v1/math/renderAST:
  *   post:
  *     tags:
  *       - Math
  *     description: Renders an AST parsed from the provided MathML into a PNG-Image
  *     consumes:
  *       - multipart/form-data
  *     produces:
  *       - image/png
  *     parameters:
  *       - name: mathml
  *         description: the mathML to be rendered into an AST
  *         in: formData
  *         required: true
  *         type: string
  *       - name: collapseSingleOperandNodes
  *         description: flag wether nodes with only one child should be collapsed
  *         in: formData
  *         required: false
  *         type: boolean
  *         default: false
  *       - name: nodesToBeCollapsed
  *         description: ids of apply nodes to be collapsed </br> Example ["p1.1.m1.1.4.1.cmml", "p1.1.m1.1.3.3.7.1.cmml"]
  *         in: formData
  *         required: false
  *         type: string
  *       - name: width
  *         description: width of the rendered PNG
  *         in: formData
  *         required: false
  *         type: integer
  *         default: 500
  *       - name: height
  *         description: height of the rendered PNG
  *         in: formData
  *         required: false
  *         type: integer
  *         default: 500
  *     responses:
  *       200:
  *         description: abstract syntax tree
  *         schema:
  *           type: file
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
      name: 'width',
      origin: 'BODY',
      type: 'int',
      optional: true,
      default: 500
    },
    {
      name: 'height',
      origin: 'BODY',
      type: 'int',
      optional: true,
      default: 500
    }]),
  astController.renderAST);

/**
* @swagger
* /api/v1/math/parseCytoscapedMergedAst:
*   post:
*     tags:
*       - Math
*     description: Returns nodes and edges prepared to be rendered into a merged AST with cytoscape
*     consumes:
*       - multipart/form-data
*     produces:
*       - application/json
*     parameters:
*       - name: reference_mathml
*         description: the mathML of reference document
*         in: formData
*         required: true
*         type: string
*       - name: comparison_mathml
*         description: the mathML of comparison document
*         in: formData
*         required: true
*         type: string
*       - name: similarities
*         description: the JSON containing match information
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: merged abstract syntax tree
*         schema:
*           type: object
*           properties:
*             cytoscapedMergedAST:
*               $ref: '#/definitions/cytoscaped'
*/
astRouter.post('/parseCytoscapedMergedAst',
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
                  },
                  {
                    name: 'width',
                    origin: 'BODY',
                    type: 'int',
                    optional: true,
                    default: 500
                  },
                  {
                    name: 'height',
                    origin: 'BODY',
                    type: 'int',
                    optional: true,
                    default: 500
                  }]),
                astController.parseCytoscapedMergedAst);

/**
* @swagger
* /api/v1/math/renderMergedAST:
*   post:
*     tags:
*       - Math
*     description: Renders a merged AST based on similarities of the two provided MathML formulae
*     consumes:
*       - multipart/form-data
*     produces:
*       - image/png
*     parameters:
*       - name: reference_mathml
*         description: the mathML of reference document
*         in: formData
*         required: true
*         type: string
*       - name: comparison_mathml
*         description: the mathML of comparison document
*         in: formData
*         required: true
*         type: string
*       - name: similarities
*         description: the JSON containing match information
*         in: formData
*         required: true
*         type: string
*       - name: width
*         description: "Width of the rendered PNG if Accept: image/png is sent"
*         in: formData
*         required: false
*         type: integer
*         default: 500
*       - name: height
*         description: "Height of the rendered PNG if Accept: image/png is sent"
*         in: formData
*         required: false
*         type: integer
*         default: 500
*     responses:
*       200:
*         description: a PNG-Image displaying the merged abstract syntax tree
*         schema:
*           type: file
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
                  },
                  {
                    name: 'width',
                    origin: 'BODY',
                    type: 'int',
                    optional: true,
                    default: 500
                  },
                  {
                    name: 'height',
                    origin: 'BODY',
                    type: 'int',
                    optional: true,
                    default: 500
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
