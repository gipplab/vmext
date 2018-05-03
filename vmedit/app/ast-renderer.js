'use strict';


const CodeMirror = require('codemirror/lib/codemirror.js');
require('codemirror/mode/xml/xml.js');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/display/fullscreen.js');
const $ = require('jquery');


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
  /**
   * @const {CodeMirror} code Mirror lib
   */
  updatePreview(formats.cmml.cm.doc);
  const mmlCy = require('MathML/cytoscape');
  const container = document.getElementById('mast');
  const mml = mmlCy.mml(formats.cmml.cm.getValue());
  const cy = mml.toCytoscape({
    container,
    boxSelectionEnabled: false,
    autounselectify: true,
    applyForm: true
  });
  cy.nodes().on('mouseover', (e) => {
    const n = e.target.data();
    const location = {
      cmml: n.estimateLocation({ line: -1, ch: 0 }),
      pmml: n.refNode().estimateLocation({ line: -1, ch: 0 })
    };
    Object.keys(formats).forEach((f) => {
      const cm = formats[f].cm || false;
      const line = location[f] || false;
      if (cm && line) {
        formats[f].marker = cm.markText(line.start, line.end, { className: 'highlight' });
        cm.scrollIntoView({ from: line.start, to: line.end });
      }
    });
    document.getElementById(n.refNode().id).classList.add('highlight');
  }
  );
  cy.nodes().on('mouseout', (e) => {
    Object.keys(formats).forEach((f) => {
      const marker = formats[f].marker;
      if (marker) {
        marker.clear();
      }
      $('.highlight').removeClass('highlight');
    });
  }
  );

  function getNearest(n) {
    const pn = n.position();
    let nearest = n;
    let minD = Number.MAX_VALUE;
    cy.nodes().forEach((m) => {
      if (n.data().id !== m.data().id) {
        const pm = m.position();
        const d = Math.hypot(pm.x - pn.x, pm.y - pn.y);
        if (d < minD) {
          nearest = m;
          minD = d;
        }
      }
    });
    return nearest;
  }

  cy.nodes().on('free', (e) => {
    const n = e.target;
    const nearest = getNearest(n);

    console.log(`free ${n.data().id} near ${nearest.data().id} `);
  });
  cy.nodes().on('drag', (e) => {
    const n = e.target;
    console.log(`drag ${n.data().id}`);
  });
}

function updatePreview(doc) {
  document.getElementById('preview').innerHTML = doc.getValue();
}

window.onload = function init() {
  CodeMirror.registerHelper('hint','xml',(editor,callback) => {
    const lineContent = editor.getLine(editor.getCursor().line);
    const cursorPos = editor.getCursor().ch;
    const lineNum = editor.getCursor().line;
    const rdf = require('Wikidata/Rdf');
    rdf(lineContent,lineNum,cursorPos).then((hint) => {
      hint.from = CodeMirror.Pos(hint.from.line, hint.from.char);
      hint.to = CodeMirror.Pos(hint.to.line, hint.to.char);
      return hint;
    }).done(callback);
  });
  CodeMirror.hint.xml.async = true;
  Object.keys(formats).forEach((f) => {
    const mml = document.getElementById(f);
    formats[f].cm = CodeMirror(mml, { lineNumbers: true,
      'extraKeys': {
        'Ctrl-Space': 'autocomplete',
        F11(cm) {
          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        Esc(cm) {
          if (cm.getOption("fullScreen")) { cm.setOption("fullScreen", false); }
        } },
      hintOptions:{ completeSingle: false } });
  });
  [].forEach.call(
    elem.options,
    (o) => {
      const doc = CodeMirror.Doc(o.value, 'application/xml');
      doc.on('change',(doc) => {
        updatePreview(doc);
      });
      buffers[o.label] = doc;
    }
  );

  elem.addEventListener('change', () => {
    callAPI();
  });
  callAPI();
  window.formats = formats;
};
