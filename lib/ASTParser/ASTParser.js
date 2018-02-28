'use strict';

const xmldom = require('xmldom');
const xpath = require('xpath');
const opMap = require('./operationMap');
const Serializer = xmldom.XMLSerializer;
const log = require('lib/logger');


function addTextLength(lastChild, pos) {
  const lines = lastChild.textContent.split(/\r\n|\r|\n/);
  pos.line += lines.length - 1;
  const lenLast = lines[lines.length - 1].length;
  if (lines.length > 1) {
    pos.ch = lenLast;
  } else {
    pos.ch += lenLast;
  }

}

function getNodePos(n, addNext) {
  const pos = {
    line: n.lineNumber - 1, // CodeMirror starts counting at 1
    ch: n.columnNumber - 1
  };
  if (addNext && n.hasChildNodes()) {
    const lastChild = n.lastChild;
    if (lastChild.hasChildNodes()) {
      // recurse
      pos.next = getNodePos(lastChild,true).next;
    } else {
      // found last element
      pos.next = getNodePos(lastChild);
      addTextLength(lastChild, pos.next);
    }
  }

  return pos;
}


function serialize(element) {
  if (element) {
    if (typeof element === 'string') {
      return element;
    }
    return new Serializer().serializeToString(element);
  }
  return null;
}

function extractPresentation(json, key) {
  const presentation = json[key];
  if (presentation && typeof presentation === 'object') {
    if (!json.pos.pmml && presentation.lineNumber) {
      json.pos.pmml = getNodePos(presentation, true);
    }
    json[key] = serialize(presentation, true);
  }
}

function attachInfo(json, node) {
  const cd = node.getAttribute('cd');
  if (cd) {
    json.cd = cd;
    json.symbol = node.textContent;
  } else if (node.localName === 'cs') {
    json.cs = node.textContent;
  }
  json.pos = { cmml: getNodePos(node, true) };

  extractPresentation(json, 'nodePresentation');
  extractPresentation(json, 'presentation');
  return json;
}

module.exports = class ASTParser {

  constructor(xml, options = {}) {
    this.doc = this.clean(xml);
    this.select = xpath.useNamespaces({ m: 'http://www.w3.org/1998/Math/MathML' });
    this.options = Object.assign({
      collapseApply: false
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
    const childElements = this.select('*', applyElement); // remove empty text nodes
    const operationElement = this.options.collapseApply ? childElements.shift() || applyElement : applyElement;


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
    if (applyXref) {
      presentationElement = this.getElementById(applyXref);
    }
    if (!applyElement.hasAttribute('id')) {
      throw new Error('MathML apply elements don\'t have ids.');
    }
    const applyId = applyElement.getAttribute('id');
    const firstChild = childElements[0];
    firstChild.applyId = applyId;

    const operationCd = operationElement.getAttribute('cd');

    // return whole subtree mathml if element is marked ambiguous
    if (operationCd === 'ambiguous') {
      return {
        name: 'ambiguous',
        presentation: serialize(presentationElement),
        nodePresentation: serialize(presentationElement),
        id: applyId,
        presentation_id: applyXref
      };
    }

    // descend into subtree and collect results
    const children = childElements.map(this.extractChilds, this);
    return attachInfo({
      name: opName,
      presentation: presentationElement,
      nodePresentation: opPresentationElement,
      children,
      id: applyId,
      presentation_id: applyXref,
      properties: {
        firstChild: firstChild.getAttribute('id'),
        applyId: applyElement.applyId || false
      }
    }, operationElement);
  }

  extractChilds(element) {
    if (element.tagName === 'apply') {
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
    const opName = element.tagName;
    const opXrefAttr = element.getAttribute('xref');
    const opXref = opXrefAttr || null;
    const opPresentationElement = opMap.hasOwnProperty(opName) ? opMap[opName] : leafPresentation;
    return attachInfo({
      // presentation: leafPresentation,
      nodePresentation: opPresentationElement,
      name,
      id: elementId,
      presentation_id: xref,
      properties: {
        applyId: element.applyId || false
      }
    }, element);
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

}
;
