'use strict';
const path = require('path'),
      dom = require('xmldom').DOMParser,
      xpath = require('xpath'),
      ConflictError = require(path.join(process.cwd(), 'errorHandler', 'ConflictError'));

module.exports = class XMLParser {
  constructor(xml) {
    this.doc = new dom().parseFromString(xml);
    this.select = xpath.useNamespaces({"m": "http://www.w3.org/1998/Math/MathML"});
  }

  parse(callback) {
    let content = this.select('//m:annotation-xml[@encoding="MathML-Content"]', this.doc)[0];
    const result = this.parseApply(this.select('m:apply', content)[0]);
    callback(null, result);
  }

  parseApply(applyElement) {
    const childElements = this.select('*', applyElement)
    const operationElement = childElements.shift();

    // Lookup operation name from Presentation MathML, fallback on tagName if no xref attribute present
    const opXrefAttr = this.select('@xref', operationElement)[0];
    const opXref = opXrefAttr ? opXrefAttr.value : null;
    const opName = opXref ? this.getXrefContent(opXref) : operationElement.tagName;

    const children = childElements.map(element => {
      if (element.tagName == 'apply') {
        return this.parseApply(element);
      } else {
        let xref = this.select('@xref', element)
        let name = null;
        if (xref.length > 0) {
          name = this.getXrefContent(xref[0].value);
        } else {
          name = this.select('text()', element);
        }
        return { name }
      }
    });
    return {
      name: opName,
      children
    };
  }

  getXrefContent(xref) {
    return this.select(`//*[@id="${xref}"]/text()`, this.doc)[0].nodeValue
  }
};
