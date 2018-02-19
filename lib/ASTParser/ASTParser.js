'use strict';

const xmldom = require('xmldom');
const xpath = require('xpath');
const opMap = require('./operationMap');
const Serializer = xmldom.XMLSerializer;
const log = require('lib/logger');

function attachInfo(json, node) {
  const cd = node.getAttribute('cd');
  if (cd) {
    json.cd = cd;
    json.symbol = node.textContent;
  } else  if (node.localName === 'cs') {
    json.cs = node.textContent;
  }
  return json;
}

module.exports = class ASTParser {
  constructor(xml, options = {}) {
    this.doc = this.clean(xml);
    this.select = xpath.useNamespaces({ m: 'http://www.w3.org/1998/Math/MathML' });
    this.options = Object.assign({
      collapseSingleOperandNodes: true,
      nodesToBeCollapsed: []
    }, options);
  }

  // from https://www.sitepoint.com/removing-useless-nodes-from-the-dom/
  clean(node) {
    for (let n = 0; n < node.childNodes.length; n++) {
      const child = node.childNodes[n];
      if (child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue))) {
        node.removeChild(child);
        n--;
      } else if (child.nodeType === 1) {
        this.clean(child);
      }
    }
    return node;
  }

  parse() {
    return new Promise((resolve, reject) => {
      try {
        const mainElement = this.getMainElement();
        resolve(mainElement);
      } catch (e) {
        // noinspection JSUnresolvedFunction
        log.error(e);
        reject(e);
      }
    });
  }

  getMainElement() {
    let content = this.select('//m:annotation-xml[@encoding="MathML-Content"]', this.doc, true);
    const pmmlContent = this.select('//m:annotation-xml[@encoding="MathML-Presentation"]', this.doc, true);
    if (!content) {
      if (!pmmlContent) {
        throw new Error('No content MathML present');
      }
      // use semantic node as root, first child should be the first cmml node
      content = this.select('//m:semantics', this.doc, true);
    }
    return this.parseApply(content.firstChild);
  }

  parseApply(applyElement) {
    const childElements = this.select('*', applyElement);
    const operationElement = childElements.shift() || applyElement;

    // Lookup operation name from Presentation MathML,
    // fallback on tagName if no xref attribute present
    const opXrefAttr = operationElement.getAttribute('xref');
    const opXref = opXrefAttr || null;
    const opName = operationElement.tagName;

    // presentation MathML for the operation Element
    const opPresentationElement = opMap.hasOwnProperty(opName) ? opMap[opName] : this.getElementById(opXref);

    // presentation mathml for full subtree
    let presentationElement = null;
    const applyXref = applyElement.getAttribute('xref');
    if (applyXref) { presentationElement = this.getElementById(applyXref); }
    if (!applyElement.hasAttribute('id')) {
      throw new Error('MathML apply elements don\'t have ids.');
    }
    const applyId = applyElement.getAttribute('id');

    const operationCd = operationElement.getAttribute('cd');

    // return whole subtree mathml if element is marked ambiguous
    if (operationCd === 'ambiguous') {
      return {
        name: 'ambiguous',
        presentation: this.constructor.serialize(presentationElement),
        nodePresentation: this.constructor.serialize(presentationElement),
        id: applyId,
        presentation_id: applyXref
      };
    }

    // descend into subtree and collect results
    const children = childElements.map(this.extractChilds,this);

    return attachInfo({
      name: opName,
      presentation: this.constructor.serialize(presentationElement),
      nodePresentation: this.constructor.serialize(opPresentationElement),
      children,
      id: applyId,
      presentation_id: applyXref
    }, operationElement);
  }

  extractChilds(element) {
    if (element.tagName === 'apply' &&
      !this.isSingleOperandNodeToBeCollapsed(element) &&
      !this.isNodeToBeCollapsed(element)) {
      return this.parseApply(element);
    }
    const xref = element.getAttribute('xref');
    const elementId = element.getAttribute('id');

    let name = null;
    let leafPresentation = null;
    if (xref.length > 0) {
      leafPresentation = this.getElementById(xref);
      name = this.getXrefTextContent(xref);
    } else {
      name = element.textContent;// this.select('text()', element);
    }
    return attachInfo({
      nodePresentation: this.constructor.serialize(leafPresentation),
      name,
      id: elementId,
      presentation_id: xref
    }, element);
  }
  isSingleOperandNodeToBeCollapsed(element) {
    if (this.options.collapseSingleOperandNodes) {
      return this.select('m:apply', element).length < 1 &&
        this.select('*', element).length <= 2;
    }
    return false;
  }

  static serialize(element) {
    if (element) {
      if (typeof element === 'string') {
        return element;
      }
      return new Serializer().serializeToString(element);
    }
    return null;
  }

  getXrefTextContent(xref) {
    const textElement = this.select(`//*[@id="${xref}"]/text()`, this.doc, true);
    if (textElement) {
      return textElement.textContent;
    }
    return 'collapsed content';
  }

  getElementById(xref) {
    return this.select(`//*[@id="${xref}"]`, this.doc, true);
  }

  isNodeToBeCollapsed(element) {
    return this.options.nodesToBeCollapsed.includes(element.getAttribute('id'));
  }
};
