'use strict';

/* global document*/

document.addEventListener('DOMContentLoaded', () => {
  const mmlCy = require('./MathML/cytoscape');
  const cytoscape = require('cytoscape');
  const dagre = require('cytoscape-dagre');
  const container = document.getElementById('cy-container');
  const mmlIn = document.getElementById('mmlin');
  const mml = mmlCy(mmlIn.value);
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

  });
  cytoscape.use(dagre);
  cy.layout({
    name: 'dagre',
    fit:true
  }).run();

});
