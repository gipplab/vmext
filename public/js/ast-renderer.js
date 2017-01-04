'use strict';

function callAPI(evt) {
  evt.preventDefault();
  let formData = new FormData();
  const accept = document.querySelector('.option-svg').checked ? 'image/svg+xml': 'application/json';
  formData.append('mathml', document.querySelector('#textarea').value);
  formData.append('renderFormula', document.querySelector('.option-renderFormula').checked);
  formData.append('collapseSingleOperandNodes', document.querySelector('.option-collapseOneChildNodes').checked);
  formData.append('nodesToBeCollapsed', document.querySelector('.option-nodesToBeCollapsed').value);
  fetch('/api/v1/math/renderAST', {
    method: 'POST',
    headers: new Headers({
      'Accept': accept,
    }),
    body: formData
  }).then(function(data){
    data.headers.get('content-type');
    return data.text().then((text) => {
      return {
        headers: data.headers,
        text
      }
    });
  }).then(function(result){
    document.querySelector('.renderedAST').innerHTML = result.text;
    if (result.headers.get('content-type') === 'image/svg+xml; charset=utf-8') {
      eval(decodeHTML(document.querySelector('.renderedAST script').innerHTML));
    }
  }).catch(console.log);
}

function decodeHTML(html){
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

window.onload = function init() {
  var select = document.querySelector('#MathMLexamples');
  select.addEventListener('change', function(){
    var mathml = select.options[select.selectedIndex].value;
    document.querySelector('#textarea').innerHTML = mathml;
  });
};
