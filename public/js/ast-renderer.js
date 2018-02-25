'use strict';

let buffers = {};
let elem = document.getElementById('MathMLexamples');


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
  let old = editor.swapDoc(buf);
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
  selectBuffer(window.pm, elem.options[elem.selectedIndex].label);
  selectBuffer(window.cm, elem.options[elem.selectedIndex].label);
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('type', 'application/javascript');
  scriptTag.setAttribute('src', '/widgets/formula-ast-widget.js');
  scriptTag.setAttribute('mathml', window.pm.getValue());
  scriptTag.setAttribute('collapseSingleOperandNodes', document.querySelector('.option-collapseOneChildNodes').checked);
  scriptTag.setAttribute('nodesToBeCollapsed', document.querySelector('.option-nodesToBeCollapsed').value);

  const container = document.querySelector('.abstract-syntax-tree');
  container.innerHTML = "";
  container.appendChild(scriptTag);
}

window.onload = function init() {

  let pmml = document.getElementById('pmml');
  let cmml = document.getElementById('cmml');

  window.pm = CodeMirror(pmml, { lineNumbers: true });
  window.cm = CodeMirror(cmml, { lineNumbers: true });

  [].forEach.call(
    elem.options,
    o => buffers[o.label] = CodeMirror.Doc(o.value, 'application/xml')
  );

  callAPI();

  elem.addEventListener('change', function(){
    callAPI();
  });
};

const renderPNG = () => {
  const canvas = document.querySelector('iframe').contentDocument.querySelectorAll('canvas')[2];
  document.querySelector('.btn-download').href = canvas.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
  ;
};

