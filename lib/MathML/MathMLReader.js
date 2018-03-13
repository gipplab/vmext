'use strict';

const xTraverse = require('xtraverse');
const xPath = require('xpath');

const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';

const xCmml = xPath.parse('//m:annotation-xml[@encoding="MathML-Content"]');
const xPmml = xPath.parse('//m:annotation-xml[@encoding="MathML-Presentation"]');
const xSemantics = xPath.parse('//m:semantics');

// const log = require('lib/logger');


module.exports = class MathMLReader {

  constructor(xml, options = {}) {
    this.xml = xTraverse(xml);
    this.doc = this.xml[0].ownerDocument;

  }

  /**
   * Returns the first result for a xpath query
   * @param {XPathEvaluator} path
   * @return {Node}
   */
  select1(path) {
    return xTraverse(path.select1({
      node:this.doc,
      namespaces:{
        m: MATHML_NS
      }
    }));
  }

  get contentRoot() {
    let content = this.select1(xCmml);
    if (content.length === 0) {
      const pmmlContent = this.select1(xPmml);
      if (pmmlContent.length === 0) {
        throw new Error('No content MathML present');
      }
      // use semantic node as root, first child should be the first cmml node
      content = this.select1(xSemantics);
    }
    return content.children().first();
  }
};
