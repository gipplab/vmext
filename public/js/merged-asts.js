'use strict';

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
