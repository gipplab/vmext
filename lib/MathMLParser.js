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
    const opName = opXref ? this.getXrefTextContent(opXref) : this.replaceOperationName(operationElement.tagName);

    // presentation MathML for the operation Element
    const opPresentationElement = opXref ? this.getElementById(opXref) : null;

    // presentation mathml for full subtree
    let presentationElement = null;
    const applyXref = this.select('@xref', applyElement)[0];
    if (applyXref) presentationElement = this.getElementById(applyXref.value);

    const operationCd = this.select('@cd', operationElement);
    
    // return whole subtree mathml if element is marked ambiguous
    if (operationCd.length > 0 && operationCd[0].value == 'ambiguous') {
      return {
        name: 'ambiguous',
        presentation: this.serialize(presentationElement),
        nodePresentation: this.serialize(presentationElement) 
      }
    }

    // descend into subtree and collect results
    const children = childElements.map(element => {
      if (element.tagName == 'apply') {
        return this.parseApply(element);
      } else {
        let xref = this.select('@xref', element)
        let name = null;
        let leafPresentation = null;
        if (xref.length > 0) {
          leafPresentation = this.getElementById(xref[0].value);
          name = this.getXrefTextContent(xref[0].value);
        } else {
          name = this.select('text()', element);
        }
        return {
          nodePresentation: this.serialize(leafPresentation),
          name
        }
      }
    });

    return {
      name: opName,
      presentation: this.serialize(presentationElement),
      nodePresentation: this.serialize(opPresentationElement),
      children
    };
  }

  serialize(element) {
    if (element) {
      return new serializer().serializeToString(element);
    }
    return null;
  }

  getXrefTextContent(xref) {
    return this.select(`//*[@id="${xref}"]/text()`, this.doc)[0].nodeValue
  }

  getElementById(xref) {
    return this.select(`//*[@id="${xref}"]`, this.doc)[0]
  }

  replaceOperationName(opName){
    let o = {
      divide: '/',
      times: '·'
    };
    return o[opName];
  }
};
