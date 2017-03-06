'use strict';

function callAPI(evt) {
  evt.preventDefault();

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
    document.querySelector('#textarea').innerHTML = mathml;
  });
};

const renderPNG = () => {
  const canvas = document.querySelector('iframe').contentDocument.querySelectorAll('canvas')[2];
  document.querySelector('.btn-download').href = canvas.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');;
};
