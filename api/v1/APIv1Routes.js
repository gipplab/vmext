'use strict';

const express = require('express');
const v1Router = module.exports = express.Router({ mergeParams: true });

v1Router.use('/math', require('./routes/abstractSyntaxTreeRoutes'));
