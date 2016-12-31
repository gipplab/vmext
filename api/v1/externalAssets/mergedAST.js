'use strict';

let formData = new FormData();
formData.append('reference_mathml', document.querySelector('#referenceMML').value);
formData.append('comparison_mathml', document.querySelector('#comparisonMML').value);
formData.append('comparison_mml', document.querySelector('#comparisonMML').value);
formData.append('similarities', document.querySelector('#similarities').value);
fetch('/api/v1/math/renderMergedAST', {
  method: 'POST',
  headers: new Headers({
    'Accept': 'application/json',
  }),
  body: formData
}).then(function(response) {
  return response.json();
}).then(function(data) {
  var cy =  cytoscape({
    container: document.querySelector('#cy'),
    elements: data,
    style: [
      {
        selector: 'node',
        style: {
          shape: 'roundrectangle',
          'background-color': 'white',
          'background-image': 'data(presentation)',
          'background-fit': 'contain',
          width: '50px',
          height: '50px',
          'border-width': '1px'
        }
      },
      {
        selector: 'edge',
        style: {
          'target-arrow-shape': 'triangle',
          'source-arrow-shape': 'triangle',
          'line-color': function(ele) {
            return (ele.data().type === 'match') ? 'RED' : 'BLACK';
          }
        }
      }
    ],
    layout: {
      name: 'dagre',
      directed: true
    }
  });
}).catch(console.error);
