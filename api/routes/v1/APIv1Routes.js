'use strict'
let   path = require('path'),
      fs = require('fs'),
      express = require('express'),
      v1Router = express.Router({mergeParams: true});


v1Router.use('/render', require('./abstractSyntaxTreeRoutes'));

module.exports = v1Router;
