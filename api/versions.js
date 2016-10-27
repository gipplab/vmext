'use strict'
let path = require('path'),
    express = require('express'),
    publicRouter = module.exports = express.Router({mergeParams: true});

publicRouter.use('/v1', require('./v1/APIv1Routes'));
