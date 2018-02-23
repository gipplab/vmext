'use strict';

document.addEventListener('astRendered', (e) => {
  document.querySelector('.btn-download').style.display = 'block';
});

function callAPI(evt) {
  if (evt) {
    evt.preventDefault();
  }
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('type', 'application/javascript');
  scriptTag.setAttribute('src', '/widgets/formula-ast-widget.js');
  scriptTag.setAttribute('mathml',document.querySelector('#textarea').value);
  scriptTag.setAttribute('collapseSingleOperandNodes', document.querySelector('.option-collapseOneChildNodes').checked);
  scriptTag.setAttribute('nodesToBeCollapsed', document.querySelector('.option-nodesToBeCollapsed').value);

  const container = document.querySelector('.abstract-syntax-tree');
  container.innerHTML = "";
  container.appendChild(scriptTag);
}

window.onload = function init() {
  var select = document.querySelector('#MathMLexamples');
  select.addEventListener('change', function(){
    var mathml = select.options[select.selectedIndex].value;
    window.cm.toTextArea(); // restore the text area
    document.querySelector('#textarea').value=mathml;
    window.cm = cmFromText();
    callAPI();
  });

  function cmFromText() {
    return CodeMirror.fromTextArea(document.getElementById('textarea'), {
        lineNumbers: true,
        mode: "application/xml"
      }
    );
  }

  window.cm = cmFromText();
  callAPI();
};

const renderPNG = () => {
  const canvas = document.querySelector('iframe').contentDocument.querySelectorAll('canvas')[2];
  document.querySelector('.btn-download').href = canvas.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');;
};

