'use strict';

const express = require('express');
const publicRouter = module.exports = express.Router({ mergeParams: true });

publicRouter.use('/v1', require('./v1/APIv1Routes'));
