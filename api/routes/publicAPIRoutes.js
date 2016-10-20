'use strict'
let path = require('path'),
    fs = require('fs'),
    express = require('express'),
    publicRouter = express.Router({mergeParams: true});

publicRouter.use('/v1', require('./v1/APIv1Routes'));

module.exports = publicRouter;
