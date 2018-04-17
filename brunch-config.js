'use strict';

const testData = require('./locals');

// See http://brunch.io for documentation.
module.exports = {
  files :{
    javascripts: {
      joinTo: {
        'vendor.js':  /^(?!app)/,
        'app.js': /^app/
      }
    },
    stylesheets: { joinTo: 'app.css' }
  },
  plugins: {
    babel: { presets: ['latest'] },
    pug: {
      preCompile: true,
      locals: testData.locals
    }
  },
  npm : {
    styles:{
      codemirror:['lib/codemirror.css'],
      bootstrap: ['dist/css/bootstrap.css']
    }
  }
};
