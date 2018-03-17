'use strict';

const mml = require('./MathMLRenderer');
// language=XML
const graphHeader =  `<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns 
   http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd"/>`;

mml.base.prototype.toGraphML = function() {
  const g = mml(graphHeader);
  return g;

};

module.exports = mml;
