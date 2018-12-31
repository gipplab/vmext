'use strict';

const testData = require('../testData');

// See http://brunch.io for documentation.
module.exports = {
  files :{
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app)/, // Files that are not in `app` dir.
        'app.js': /^app/
      }
    },
    stylesheets: { joinTo: 'app.css' }
  },
  plugins: {
    babel: { presets: ['latest'] },
    pug: {
      preCompilePattern: /.pug$/,
      locals: testData.locals
    }
  },
  npm : {
    styles:{
      codemirror:['lib/codemirror.css'],
      bootstrap: ['dist/css/bootstrap.css']
    }
  } };
