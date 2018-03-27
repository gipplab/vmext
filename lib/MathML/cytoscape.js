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

  function isApply(n) {
    return n.data() || n.data()[0].name() === 'apply';
  }

  this._addCTreeElements(elements, addNode, addEdge);
  Object.assign(options, { elements });
  const cy = cytoscape(options);

  const applyNodes = cy.nodes().filter(isApply);
  applyNodes.forEach((a) => {
    const firstX = a.data().children().first();
    const firstCy = cy.getElementById(firstX.id);
    if (firstX.children().length === 0 && firstCy.length) {
      firstCy.on('click' ,(e) => {
        const n = e.target;
        a.data().expansion = 'first';
        a.style('background-image', a.data().imgUrl());
        n.hide();
      });
    }
  });
  applyNodes.on('click',(e) => {
    const n = e.target;
    const expansion = n.data().expansion;
    if (expansion === 'collapsed') {
      n.data().expansion = false;
      const nodesToShow = n.successors(n => n.hidden());
      nodesToShow.show();
    } else {
      n.data().expansion = 'collapsed';
      const nodesToHide = n.successors(n => n.visible());
      nodesToHide.hide();
    }
    n.style('background-image', n.data().imgUrl());
  });
  return cy;
};

module.exports = mml;

