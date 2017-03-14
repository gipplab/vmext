'use strict';

const jsdom = require('jsdom');
const b64 = require('base64-stream');
const stream = require('stream');

function getStream(text) {
  const s = new stream.Duplex();
  s.push(text);
  s.push(null);
  return s;
}

function raf(fn) {
  if (fn) {
    setTimeout(function () {
      fn(Date.now());
    }, 1000 / 60);
  }
}
jsdom.createVirtualConsole().sendTo(console);

module.exports = class SnapRenderer {
  static renderSingleTree(cytoNodes, width, height) {
    cytoNodes = cytoNodes.forEach((ele) => {
      ele._private = {
        data: { id: ele.data.id }
      };
    });
    return new Promise((resolve, reject) => {
      jsdom.env({
        html: '<div id="cy-container"></div>',
        scripts: [
          './public/vendor/js/dagre.min.js',
          './public/vendor/js/cytoscape.js',
          './public/vendor/js/cytoscape-dagre.js',
          './public/widgets/shared-resources/defaults.js',
          './lib/ASTRenderer/renderScripts/singleAst.js'
        ],
        created: function (err, window) {
          window.requestAnimationFrame = raf;
        },
        done: function (err, window) {
          if (err) return reject(err);
          window.beginCyto(cytoNodes)
          .on('layoutstop', () => {
            resolve(getStream(window.cy.png(
              {
                maxWidth: width,
                maxHeight: height,
              }
            )).pipe(b64.decode()));
          });
        }
      });
    });
  }

  static renderMergedTree(cytoNodes, width, height) {
  }
};
