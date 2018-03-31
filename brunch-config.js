'use strict';

exports.paths = {
  watched: ['frontend']
};
// See http://brunch.io for documentation.
exports.files = {
  javascripts: {
    joinTo: {
      //    'vendor.js': /^(?!app)/, // Files that are not in `app` dir.
      'app.js': /^frontend\/js/
    }
  },
  stylesheets: { joinTo: 'app.css' }
};

exports.plugins = {
  babel: { presets: ['latest'] },
  pug: {
    preCompile: true,
    locals: { mml: [1,2,3,4,5,6],
      sim:[1,2,3] }
  }
};

exports.modules = {
  // nameCleaner: path => path.replace(/^xcx/, '')
};
