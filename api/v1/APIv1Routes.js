'use strict'
let   path = require('path'),
      express = require('express'),
      v1Router = module.exports = express.Router({mergeParams: true});


v1Router.use('/ast', require('./routes/abstractSyntaxTreeRoutes'));
