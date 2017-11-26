'use strict';


// Run jshint as part of normal testing
require('mocha-eslint')([
  'routes',
  'lib',
  'api'
], {
  timeout: 10000
});
