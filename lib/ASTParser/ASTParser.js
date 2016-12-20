'use strict';

const xmldom = require('xmldom');
const xpath = require('xpath');
const operationMap = require('./operationMap');
const DOM = xmldom.DOMParser;
const Serializer = xmldom.XMLSerializer;

module.exports = class ASTParser {
  constructor(xml, options = {}) {
    this.doc = new DOM().parseFromString(xml);
    this.select = xpath.useNamespaces({ m: 'http://www.w3.org/1998/Math/MathML' });
    this.options = Object.assign({
      collapseSingleOperandNodes: true
    }, options);
  }

  parse() {
    return new Promise((resolve, reject) => {
      const content = this.select('//m:annotation-xml[@encoding="MathML-Content"]', this.doc)[0];
      const result = this.parseApply(this.select('m:apply', content)[0]);
      resolve(result);
    });
  }

  parseApply(applyElement) {
    const childElements = this.select('*', applyElement);
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
        nodePresentation: this.constructor.serialize(presentationElement),
        id: applyXref.value
      };
    }

    // descend into subtree and collect results
    const children = childElements.map((element) => {
      if (element.tagName === 'apply' && !this.collapseNodes(element)) {
        return this.parseApply(element);
      }
      const xref = this.select('@xref', element);
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
        name,
        id: xref[0].value
      };
    });

    return {
      name: opName,
      presentation: this.constructor.serialize(presentationElement),
      nodePresentation: this.constructor.serialize(opPresentationElement),
      children,
      id: applyXref.value
    };
  }

  collapseNodes(element) {
    if (this.options.collapseSingleOperandNodes) {
      return this.select('m:apply', element).length < 1 &&
             this.select('*', element).length <= 2;
    }
    return false;
  }

  static serialize(element) {
    if (element) {
      return new Serializer().serializeToString(element);
    }
    return null;
  }

  getXrefTextContent(xref) {
    const textContent = this.select(`//*[@id="${xref}"]/text()`, this.doc);
    return textContent.length > 0 ? textContent[0].nodeValue : 'collapsed content';
  }

  getElementById(xref) {
    return this.select(`//*[@id="${xref}"]`, this.doc)[0];
  }
};
