'use strict';


const base = require('xtraverse/lib/collection.js');
const xPath = require('xpath');

const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';

const xCmml = xPath.parse('//m:annotation-xml[@encoding="MathML-Content"]');
const xPmml = xPath.parse('//m:annotation-xml[@encoding="MathML-Presentation"]');
const xSemantics = xPath.parse('//m:semantics');

// const log = require('lib/logger');

base.prototype.xref = function() {
  return this.attr('xref');
};

base.prototype.id = function() {
  return this.attr('id');
};

base.prototype.select1 = function(path) {
  return base.wrap(
    path.select1({
      node:this[0],
      namespaces:{
        m: MATHML_NS
      }
    }));
};

base.prototype.contentRoot = function() {
  const doc = base.wrap(this[0].ownerDocument);
  let content = doc.select1(xCmml);
  if (content.length === 0) {
    const pmmlContent = doc.select1(xPmml);
    if (pmmlContent.length === 0) {
      throw new Error('No content MathML present');
    }
    // use semantic node as root, first child should be the first cmml node
    content = doc.select1(xSemantics);
  }
  return content.children().first();
};


module.exports = base.wrap;
