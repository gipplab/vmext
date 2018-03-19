'use strict';

/* eslint-disable no-undef */


document.addEventListener('DOMContentLoaded', () => {
  // do your setup here
// eslint-disable-next-line no-console
  console.log('Initialized app');
  const ab = require('./logger');
  const mc = require('./MathML/cytoscape');
  const cit = require('cytoscape');
  const dag = require('cytoscape-dagre');
  // const mc = require('./MathML/GraphML');

  // const mc = require('./MathML/cytoscape.js');
  const container = document.getElementById('cy-container');
  const mmlIn = document.getElementById('mmlin');
  const mml = mc(mmlIn.value);
  // container.innerHTML=mml.toString();
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
          'background-color': '#11479e'
        }
      },

      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'width': 4,
          'target-arrow-shape': 'triangle',
          'line-color': '#9dbaea',
          'target-arrow-color': '#9dbaea'
        }
      }
    ],

  });
  cit.use(dag);
  cy.layout({
    name: 'dagre',
    fit:true
  }).run();
// eslint-disable-next-line no-console
  console.log('done');

});
