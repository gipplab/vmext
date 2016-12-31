'use strict';

let formData = new FormData();
formData.append('reference_mathml', document.querySelector('#referenceMML').value);
formData.append('comparison_mathml', document.querySelector('#comparisonMML').value);
formData.append('comparison_mml', document.querySelector('#comparisonMML').value);
formData.append('similarities', document.querySelector('#similarities').value);
fetch('/js/data.json', { // /api/v1/math/renderMergedAST
  method: 'GET', // POST
  headers: new Headers({
    Accept: 'application/json',
  }),
  //body: formData
}).then(function(response) {
  return response.json();
}).then(function(data) {
  var cy =  cytoscape({
    container: document.querySelector('#cy'),
    elements: data,
    style: [
      {
        selector: '.source-A',
        css: {
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
        selector: '.source-B',
        css: {
          shape: 'octagon',
          'background-color': 'white',
          'background-image': 'data(presentation)',
          'background-fit': 'contain',
          width: '50px',
          height: '50px',
          'border-width': '1px'
        }
      },
      {
        selector: '.matchContainer',
        css: {
          content: 'data(label)',
          'background-color': '#ffbcbc'
        }
      },
      {
        selector: '$node > node',
        css: {
          'padding-top': '10px',
          'padding-left': '10px',
          'padding-bottom': '10px',
          'padding-right': '10px',
          'text-valign': 'top',
          'text-halign': 'center',
        },
      },
      {
        selector: 'edge',
        css: {
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
