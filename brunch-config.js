'use strict';

const testData = require('./testData');

exports.paths = {
  watched: ['frontend']
};
// See http://brunch.io for documentation.
exports.files = {
  javascripts: {
    joinTo: {
      'vendor.js': /^node_modules/, // Files that are not in `app` dir.
      'lib.js': /^lib/, // Files that are not in `app` dir.
      'app.js': /^frontend\/js/
    }
  },
  stylesheets: { joinTo: 'app.css' }
};

exports.plugins = {
  babel: { presets: ['latest'] },
  pug: {
    preCompile: true,
    locals: testData.locals
  }
};


exports.modules = {
  // nameCleaner: path => path.replace(/^xcx/, '')
};
