'use strict';

const mml = require('./MathMLReader');
const cytoscape = require('cytoscape');

mml.base.prototype.toCytoscape = function() {
  const elements = [];

  function addNode(n) {
    elements.push({
      group: 'nodes',
      data: {
        id: n.id()
      }});
  }
  function addEdge(child) {
    elements.push({
      group: 'edges',
      data: {
        source: child.parent().id(),
        target: child.id()
      },
      classes: 'hierarchy'
    });
  }
  function addNodeRecurse(n) {
    addNode(n);
    n.children().map((c) => {
      const child = mml(c);
      addEdge(child);
      addNodeRecurse(child);
    }
    );
  }
  addNodeRecurse(this.contentRoot());
  return cytoscape({ elements });
};

module.exports = mml;

