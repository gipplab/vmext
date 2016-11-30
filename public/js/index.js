'use strict';

function callAPI(evt) {
  evt.preventDefault();
  let formData = new FormData();
  const accept = document.querySelector('.option-svg').checked ? 'image/svg+xml': 'application/json';
  formData.append('mathml', document.querySelector('#textarea').value);
  fetch('/api/v1/ast/render', {
    method: 'POST',
    headers: new Headers({
      'Accept': accept,
      'renderFormula': document.querySelector('.option-renderFormula').checked
    }),
    body: formData
  }).then(function(data){
    return data.text();
  }).then(function(result){
    document.querySelector('.renderedAST').innerHTML = result;
  }).catch(function(err) {
    console.log(err);
  });
}
