'use strict'
const express = require('express');
const astRouter = module.exports = express.Router({ mergeParams: true });
const multer = require('multer');
const upload = multer();
const RequestValidator = require('app/lib/RequestValidator');
const astController = require('../controller/AbstractSyntaxTreeController');

astRouter.post('/render', upload.none(), RequestValidator.multiPartFormData, astController.renderAst);
astRouter.post('/renderMML', astController.renderMML);
