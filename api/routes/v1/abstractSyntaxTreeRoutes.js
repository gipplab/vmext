'use strict'
let express = require('express'),
    astRouter = module.exports = express.Router({mergeParams: true}),
    multer = require('multer'),
    upload = multer(),
    astController = require('../../controller/v1/abstractSyntaxTreeController');

astRouter.post('/render', upload.none(), astController.renderAst);
