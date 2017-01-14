'use strict';

let formData = new FormData();
formData.append('reference_mathml', document.querySelector('#referenceMML').value);
formData.append('comparison_mathml', document.querySelector('#comparisonMML').value);
formData.append('comparison_mml', document.querySelector('#comparisonMML').value);
formData.append('similarities', document.querySelector('#similarities').value);
fetch('/api/v1/math/renderMergedAST', { // /js/data.json
  method: 'POST', // POST
  headers: new Headers({
    Accept: 'application/json',
  }),
  body: formData
}).then(function(response) {
  return response.json();
}).then(function(data) {
  const mergedAST =  cytoscape({
    container: document.querySelector('#mergedAST'),
    elements: data.mergedAST,
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
        selector: '.match.match-identical',
        css: {
          content: 'data(label)',
          label: 'Match',
          shape: 'rectangle',
          'background-color': '#ffbcbc'
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
  const referenceAST =  cytoscape({
    container: document.querySelector('#referenceAST'),
    elements: data.referenceAST,
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
  const comparisonAST =  cytoscape({
    container: document.querySelector('#comparisonAST'),
    elements: data.comparisonAST,
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

function renderTextInCanvas(canvas, text) {
  const ctx = canvas.getContext('2d');
  ctx.font = "30px Arial";
  ctx.fillText(text,1,40);
}

function drawHeaders() {
  const reference_canvas = document.querySelectorAll('#referenceAST canvas')[0];
  const comparison_canvas = document.querySelectorAll('#comparisonAST canvas')[0];
  const merged_canvas = document.querySelectorAll('#mergedAST canvas')[0];
  renderTextInCanvas(reference_canvas, 'Reference AST');
  renderTextInCanvas(comparison_canvas, 'Comparison AST');
  renderTextInCanvas(merged_canvas, 'Merged AST');
}
