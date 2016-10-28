'use strict'
let path = require('path'),
    express = require('express'),
    astRouter = module.exports = express.Router({mergeParams: true}),
    multer = require('multer'),
    upload = multer(),
    requestValidator = require(path.join(process.cwd(), 'lib', 'requestValidator')),
    astController = require('../controller/abstractSyntaxTreeController');

astRouter.post('/render', upload.none(), requestValidator.multiPartFormData, astController.renderAst);
