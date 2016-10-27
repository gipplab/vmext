'use strict'
let express = require('express'),
    astRouter = module.exports = express.Router({mergeParams: true}),
    multer = require('multer'),
    upload = multer(),
    astController = require('../controller/abstractSyntaxTreeController');

astRouter.post('/render', upload.none(), astController.renderAst);
