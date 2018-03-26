'use strict';

const mml = require('./MathMLRenderer');
const cytoscape = require('cytoscape');

mml.base.prototype.toCytoscape = function(options = {}) {
  // const g = this.toGraphML();
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
  return cytoscape(options);
};

module.exports = mml;

