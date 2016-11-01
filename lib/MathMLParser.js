'use strict';
const path = require('path'),
      xmldom = require('xmldom'),
      xpath = require('xpath'),
      ConflictError = require(path.join(process.cwd(), 'errorHandler', 'ConflictError'));

const dom = xmldom.DOMParser;
const serializer = xmldom.XMLSerializer;

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

    let presentationElement = null;
    const applyXref = this.select('@xref', applyElement)[0];
    if (applyXref) presentationElement = this.getElementById(applyXref.value);

    const operationCd = this.select('@cd', operationElement);
    if (operationCd.length > 0 && operationCd[0].value == 'ambiguous') {
      return {
        name: 'ambiguous',
        presentation: presentationElement ? new serializer().serializeToString(presentationElement) : null
      }
    }

    const children = childElements.map(element => {
      if (element.tagName == 'apply') {
        return this.parseApply(element);
      } else {
        let xref = this.select('@xref', element)
        let name = null;
        let leafPresentation = null;
        if (xref.length > 0) {
          leafPresentation = this.getElementById(xref[0].value);
          name = this.getXrefContent(xref[0].value);
        } else {
          name = this.select('text()', element);
        }
        return {
          presentation: leafPresentation ? new serializer().serializeToString(leafPresentation) : null,
          name
        }
      }
    });
    return {
      name: opName,
      presentation: presentationElement ? new serializer().serializeToString(presentationElement) : null,
      children
    };
  }

  getXrefContent(xref) {
    return this.select(`//*[@id="${xref}"]/text()`, this.doc)[0].nodeValue
  }

  getElementById(xref) {
    return this.select(`//*[@id="${xref}"]`, this.doc)[0]
  }
};
