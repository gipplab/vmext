'use strict';

const buffers = {};
const elem = document.getElementById('MathMLexamples');
const formats = { cmml:{},pmml:{} };


/**
 * from http://codemirror.net/demo/buffers.html
 * @param {CodeMirror} editor
 * @param {string} name
 */
function selectBuffer(editor, name) {
  let buf = buffers[name];
  if (buf.getEditor()) {
    buf = buf.linkedDoc({ sharedHist: true });
  }
  const old = editor.swapDoc(buf);
  let linked;
  old.iterLinkedDocs(doc => linked = doc);
  if (linked) {
    // Make sure the document in buffers is the one the other view is looking at
    const keys = Object.keys(buffers);
    for (const key of keys) {
      if (buffers[key] === old) {
        buffers[key] = linked;
      }
    }
    old.unlinkDoc(linked);
  }
  editor.focus();
}

document.addEventListener('astRendered', (e) => {
  document.querySelector('.btn-download').style.display = 'block';
});

function callAPI(evt) {
  if (evt) {
    evt.preventDefault();
  }
  Object.keys(formats).forEach((f) => {
    selectBuffer(formats[f].cm, elem.options[elem.selectedIndex].label);
  });
  const mmlCy = require('../../lib/MathML/cytoscape');
  const container = document.getElementById('mast');
  const mml = mmlCy.mml(formats.cmml.cm.getValue());
  const cy = mml.toCytoscape({ container,
    boxSelectionEnabled: false,
    autounselectify: true,
    applyForm: true
  });
  cy.nodes().on('mouseover',(e) => {
    const n = e.target.data();
    const location =    {
      cmml:n.estimateLocation({line:-1,ch:0}),
      pmml:n.refNode().estimateLocation({line:-1,ch:0})
    };
    Object.keys(formats).forEach((f) => {
      const cm = formats[f].cm || false;
      const line = location[f] || false;
      if (cm && line) {
        formats[f].marker = cm.markText(line.start, line.end, { className: 'highlight' });
        cm.scrollIntoView({ from: line.start, to: line.end });
      }
    });
  }
  );
  cy.nodes().on('mouseout',(e) => {
    const n = e.target.data();
    Object.keys(formats).forEach((f) => {
      const marker = formats[f].marker;
      if (marker) {
        marker.clear();
      }
    });
  }
  );
}

window.onload = function init() {
  Object.keys(formats).forEach((f) => {
    const mml = document.getElementById(f);
    formats[f].cm = CodeMirror(mml, { lineNumbers: true });
  });

  [].forEach.call(
    elem.options,
    o => buffers[o.label] = CodeMirror.Doc(o.value, 'application/xml')
  );

  elem.addEventListener('change', () => {
    callAPI();
  });
  callAPI();
  window.formats = formats;
};

const renderPNG = () => {
  const canvas = document.querySelector('iframe').contentDocument.querySelectorAll('canvas')[2];
  document.querySelector('.btn-download').href = canvas.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
};

document.addEventListener('DOMContentLoaded', () => {


});
