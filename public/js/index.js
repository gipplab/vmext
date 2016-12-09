'use strict';

function callAPI(evt) {
  evt.preventDefault();
  let formData = new FormData();
  const accept = document.querySelector('.option-svg').checked ? 'image/svg+xml': 'application/json';
  formData.append('mathml', document.querySelector('#textarea').value);
  formData.append('renderFormula', document.querySelector('.option-renderFormula').checked);
  formData.append('collapseSingleOperandNodes', document.querySelector('.option-collapseOneChildNodes').checked);
  fetch('/api/v1/math/renderAST', {
    method: 'POST',
    headers: new Headers({
      'Accept': accept,
    }),
    body: formData
  }).then(function(data){
    return data.text();
  }).then(function(result){
    document.querySelector('.renderedAST').innerHTML = result;
    eval(decodeHTML(document.querySelector('.renderedAST script').innerHTML));
  }).catch(function(err) {
    console.log(err);
  });
}


function decodeHTML(html){
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
