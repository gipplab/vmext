'use strict';

const xmldom = require('xmldom');
const xpath = require('xpath');
const opMap = require('../MathML/operationMap');
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
    // presentation mathml for full subtree
    let presentationElement = null;
    const applyId = applyElement.getAttribute('id');
    const applyXref = applyElement.getAttribute('xref');
    if (applyXref) {
      presentationElement = this.getElementById(applyXref);
    } else if (applyElement.applyParent) {
      log.warn(`Fallback to parent apply element for ${applyId}`);
      presentationElement = this.getElementById(applyElement.applyParent);
    } else {
      throw new Error('MathML content element has no corresponding presentation element');
    }
    if (!applyElement.hasAttribute('id')) {
      throw new Error('MathML apply elements don\'t have ids.');
    }
    const firstChild = childElements[0];
    if (firstChild) {
      firstChild.applyId = applyId;
    }
    if (applyElement.applyId) {
      for (let i = 1; i < childElements.length; i++) {
        childElements[i].applyParent = applyElement.applyId;
      }
    }
    if (applyElement.applyParent) {
      for (let i = 1; i < childElements.length; i++) {
        childElements[i].applyParent = applyId;
      }
    }
    // const operationCd = operationElement.getAttribute('cd');
    // return whole subtree mathml if element is marked ambiguous
    // if (operationCd === 'ambiguous') {
    //   return {
    //     name: 'ambiguous',
    //     presentation: serialize(presentationElement),
    //     nodePresentation: serialize(presentationElement),
    //     id: applyId,
    //     presentation_id: applyXref
    //   };
    // }

    // descend into subtree and collect results
    const children = childElements.map(this.extractChilds, this);
    const firstChildId = firstChild ? firstChild.getAttribute('id') : false;
    return attachInfo({
      name: 'apply',
      presentation: presentationElement,
      nodePresentation: opMap.apply,
      children,
      id: applyId,
      presentation_id: applyXref,
      properties: {
        firstChild: firstChildId,
        applyId: applyElement.applyId || false,
        applyParent: applyElement.applyParent || false
      }
    }, applyElement);
  }

  extractChilds(element) {
    let parentXref;
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
      log.warn(`No xref set for ${elementId}.`);
      name = element.textContent;// this.select('text()', element);
      parentXref = element.parentNode.getAttribute('xref');
      if (!parentXref) {
        throw new Error('MathML content element has no corresponding presentation element');
      }
      leafPresentation = this.getElementById(parentXref);
    }
    const opName = element.tagName;
    // const opXrefAttr = element.getAttribute('xref');
    // const opXref = opXrefAttr || null;
    const opPresentationElement = opMap.hasOwnProperty(opName) ? opMap[opName] : leafPresentation;
    return attachInfo({
      // presentation: leafPresentation,
      nodePresentation: opPresentationElement,
      name,
      id: elementId,
      presentation_id: xref || parentXref,
      properties: {
        applyId: element.applyId || false,
        applyParent: element.applyParent || false
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
