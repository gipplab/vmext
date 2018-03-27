'use strict';

const mml = require('./MathMLRenderer');
const cytoscape = require('cytoscape');

mml.base.prototype.toCytoscape = function(options = {}) {
  const elements = [];

  function addNode(elements, n) {
    elements.push({
      group: 'nodes',
      data: n,
      style:{
        'background-image': n.imgUrl(),
      },
      classes: 'top-center'
    });
  }

  function addEdge(elements, child, parent) {
    elements.push({
      group: 'edges',
      data: {
        source: parent.id,
        target: child.id
      },
      classes: 'hierarchy'
    });
  }

  this._addCTreeElements(elements, addNode, addEdge);
  Object.assign(options, { elements });
  const cy = cytoscape(options);
  cy.startBatch();

  function isApply(n) {
    return n.data() || n.data()[0].name() === 'apply';
  }

  const applyNodes = cy.nodes().filter(isApply);

  applyNodes.on('click',(e) => {
    const n = e.target;
    const expansion = n.data().expansion;
    if (expansion === 'collapsed') {
      n.data().expansion = false;
      const nodesToShow = n.successors(n => n.hidden() );
      nodesToShow.show();
    } else {
      n.data().expansion = 'collapsed';
      const nodesToHide = n.successors(n => n.visible());
      nodesToHide.hide();
    }
    n.style('background-image', n.data().imgUrl());
  });
  cy.endBatch();
  return cy;
};

module.exports = mml;

