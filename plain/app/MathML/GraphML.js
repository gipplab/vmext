'use strict';

const mml = require('./MathMLReader');
// language=XML
const graphHeader =  `<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns 
   http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <key id="cRef" for="edge" attr.type="string"/>
</graphml>`;

mml.base.prototype.toGraphML = function() {
  const g = mml(graphHeader).c('graph');
  function addNode(g,n) {
    g.c('node',{
      id: `g.${n.id}`
    }).c('data',{
      key:'cRef'
    }).text(n.id);
  }
  function addEdge(g,child,parent) {
    g.c('edge',{
      source: `g.${parent.id}`,
      target: `g.${child.id}`
    });
  }
  this._addCTreeElements(g,addNode,addEdge);
  // Hack xtraverse does not correctly initialize all DOM features
  // might be related to https://github.com/jaredhanson/node-xtraverse/blob/master/lib/collection.js#L617
  return mml(g.root().toString());

};

module.exports = mml;
