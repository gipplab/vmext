'use strict'
let express = require('express'),
    astRouter = module.exports = express.Router({mergeParams: true}),
    astController = require('../../controller/v1/abstractSyntaxTreeController');

astRouter.get('/render', astController.renderAst);
