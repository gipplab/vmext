'use strict'
const path = require('path');
const express = require('express');
const astRouter = module.exports = express.Router({mergeParams: true});
const multer = require('multer');
const upload = multer();
const requestValidator = require(path.join(process.cwd(), 'lib', 'requestValidator'));
const astController = require('../controller/AbstractSyntaxTreeController');

astRouter.post('/render', upload.none(), requestValidator.multiPartFormData, astController.renderAst);
astRouter.post('/renderMML', astController.renderMML);
