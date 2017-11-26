'use strict';


// Run jshint as part of normal testing
require('mocha-eslint')([
  'routes',
  'lib',
  'api',
  'errorHandler'
], {
  timeout: 10000
});
