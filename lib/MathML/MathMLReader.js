'use strict';

const xTraverse = require('xtraverse');
const xPath = require('xpath');

const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';

const CMML_SELECTOR = '//m:annotation-xml[@encoding="MathML-Content"]';
const PMML_SELECTOR = '//m:annotation-xml[@encoding="MathML-Presentation"]';
const SEMANTICS_SELECTOR = '//m:semantics';

// const log = require('lib/logger');


module.exports = class MathMLReader {

  constructor(xml, options = {}) {
    this.xml = xTraverse(xml);
    this.doc = this.xml[0].ownerDocument;

    this.select = xPath.useNamespaces({ m: MATHML_NS });
  }
  get contentRoot() {
    let content = this.select(CMML_SELECTOR, this.doc, true);
    const pmmlContent = this.select(PMML_SELECTOR, this.doc, true);
    if (!content) {
      if (!pmmlContent) {
        throw new Error('No content MathML present');
      }
      // use semantic node as root, first child should be the first cmml node
      content = this.select(SEMANTICS_SELECTOR, this.doc, true);
    }
    return content;
  }
};
