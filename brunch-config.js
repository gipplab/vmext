'use strict';

exports.paths = {
  watched: ['frontend/js']
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
  babel: { presets: ['latest'] }
};

exports.modules = {
  // nameCleaner: path => path.replace(/^xcx/, '')
};
