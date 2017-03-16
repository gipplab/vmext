'use strict';

document.addEventListener('astRendered', (e) => {
  document.querySelector('.btn-download').style.display = 'block';
});

function callAPI(evt) {
  evt.preventDefault();

  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('type', 'application/javascript');
  scriptTag.setAttribute('src', '/widgets/formula-similarity-widget.js');
  scriptTag.setAttribute('reference_mathml',document.querySelector('#referenceMML').value);
  scriptTag.setAttribute('comparison_mathml',document.querySelector('#comparisonMML').value);
  scriptTag.setAttribute('similarities',document.querySelector('#similarities').value);

  const container = document.querySelector('.abstract-syntax-tree');
  container.innerHTML = "";
  container.appendChild(scriptTag);
}

const renderPNG = () => {
  const canvas = document.querySelector('iframe').contentDocument.querySelectorAll('canvas')[2];
  document.querySelector('.btn-download').href = canvas.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');;
};
