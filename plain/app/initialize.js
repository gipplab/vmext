'use strict';

/* global document*/

document.addEventListener('DOMContentLoaded', () => {
  const mmlCy = require('./MathML/cytoscape');
  const cytoscape = require('cytoscape');
  const dagre = require('cytoscape-dagre');
  const container = document.getElementById('cy-container');
  const mmlIn = document.getElementById('mmlin');
  const mml = mmlCy.mml(mmlIn.value);
  const cy = mml.toCytoscape({ container,
    boxSelectionEnabled: false,
    autounselectify: true,
    style: [
      {
        selector: 'node',
        style: {
          'content': 'data(id)',
          'text-opacity': 0.5,
          'text-valign': 'center',
          'text-halign': 'right',
        }
      }
    ],
    applyForm: true
  });
  cytoscape.use(dagre);
  mmlCy.layout(cy);

});
