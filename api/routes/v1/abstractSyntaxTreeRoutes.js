'use strict'
let express = require('express'),
    astRouter = express.Router({mergeParams: true}),
    astController = require('../../controller/v1/abstractSyntaxTreeController');

astRouter.get('', astController.renderAst);

module.exports = astRouter;
