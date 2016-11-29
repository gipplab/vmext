'use strict';
const xmldom = require('xmldom');
const xpath = require('xpath');
const operationMap = require('./operationMap');

const DOM = xmldom.DOMParser;
const serializer = xmldom.XMLSerializer;

module.exports = class XMLParser {
  constructor(xml) {
    this.doc = new DOM().parseFromString(xml);
    this.select = xpath.useNamespaces({ m: 'http://www.w3.org/1998/Math/MathML' });
  }

  parse(callback) {
    const content = this.select('//m:annotation-xml[@encoding="MathML-Content"]', this.doc)[0];
    const result = this.parseApply(this.select('m:apply', content)[0]);
    callback(null, result);
  }

  parseApply(applyElement) {
    const childElements = this.select('*', applyElement)
    const operationElement = childElements.shift();

    // Lookup operation name from Presentation MathML,
    // fallback on tagName if no xref attribute present
    const opXrefAttr = this.select('@xref', operationElement)[0];
    const opXref = opXrefAttr ? opXrefAttr.value : null;
    const opName = operationElement.tagName;

    // presentation MathML for the operation Element
    const opPresentationElement = operationMap.hasOwnProperty(opName) ? operationMap[opName] : this.getElementById(opXref);

    // presentation mathml for full subtree
    let presentationElement = null;
    const applyXref = this.select('@xref', applyElement)[0];
    if (applyXref) presentationElement = this.getElementById(applyXref.value);

    const operationCd = this.select('@cd', operationElement);

    // return whole subtree mathml if element is marked ambiguous
    if (operationCd.length > 0 && operationCd[0].value === 'ambiguous') {
      return {
        name: 'ambiguous',
        presentation: this.constructor.serialize(presentationElement),
        nodePresentation: this.constructor.serialize(presentationElement)
      };
    }

    // descend into subtree and collect results
    const children = childElements.map((element) => {
      if (element.tagName === 'apply') {
        return this.parseApply(element);
      } else {
        const xref = this.select('@xref', element)
        let name = null;
        let leafPresentation = null;
        if (xref.length > 0) {
          leafPresentation = this.getElementById(xref[0].value);
          name = this.getXrefTextContent(xref[0].value);
        } else {
          name = this.select('text()', element);
        }
        return {
          nodePresentation: this.constructor.serialize(leafPresentation),
          name
        };
      }
    });

    return {
      name: opName,
      presentation: this.constructor.serialize(presentationElement),
      nodePresentation: this.constructor.serialize(opPresentationElement),
      children
    };
  }

  static serialize(element) {
    if (element) {
      return new serializer().serializeToString(element);
    }
    return null;
  }

  getXrefTextContent(xref) {
    return this.select(`//*[@id="${xref}"]/text()`, this.doc)[0].nodeValue;
  }

  getElementById(xref) {
    return this.select(`//*[@id="${xref}"]`, this.doc)[0];
  }
};
