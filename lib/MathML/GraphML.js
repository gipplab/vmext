'use strict';

const mml = require('./MathMLRenderer');
// language=XML
const graphHeader =  `<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns 
   http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd"/>`;

mml.base.prototype.toGraphML = function() {
  const g = mml(graphHeader).c('graph');
  function addNode(n) {
    g.c('node',{
      id: `g.${n.id()}`
    });
  }
  function addEdge(child) {
    g.c('edge',{
      source: `g.${child.parent().id()}`,
      target: `g.${child.id()}`
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
  // Hack c does not correctly initialize all DOM features
  // might be related to https://github.com/jaredhanson/node-xtraverse/blob/master/lib/collection.js#L617
  return mml(g.root().toString());

};

module.exports = mml;
