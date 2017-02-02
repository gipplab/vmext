'use strict';

let formulaAST;
window.addEventListener('message', paramsReveived, false);

function paramsReveived(event) {
  fetchData(event.data)
    .then((result) => {
      document.querySelector('.formula-container').innerHTML = result.mathml;
      MathJax.Hub.Typeset();
      renderAST(result.cytoscapedAST);
      registerEventListeners();
      document.querySelector('.gif-loader').style.display = 'none';
    })
    .catch((err) => {
      document.querySelector('.gif-loader').style.display = 'none';
      document.querySelector('.gif-error').style.display = 'block';
      document.querySelector('body').style['background-color'] = '#101018';
      console.error(err);
    });
}

function fetchData({ mathml, collapseSingleOperandNodes, nodesToBeCollapsed }) {
  const formData = new FormData();
  formData.append('mathml', mathml);
  formData.append('collapseSingleOperandNodes', collapseSingleOperandNodes);
  formData.append('nodesToBeCollapsed', nodesToBeCollapsed);
  return fetch('http://localhost:4001/api/v1/math/renderAST?cytoscaped=true', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
    }),
    referrerPolicy: 'no-referrer',
    body: formData
  }).then((response) => {
    return response.json().then((data) => {
      if (!response.ok) {
        return Promise.reject(data.Error.output.payload);
      }
      return data;
    });
  });
}

function renderAST(elements) {
  formulaAST = cytoscape({
    container: document.querySelector('.cy-container'),
    elements,
    style: [
      {
        selector: '.source-A',
        css: {
          shape: 'roundrectangle',
          'background-color': 'white',
          'background-image': 'data(presentation)',
          'background-fit': 'none',
          width: ele => extractDimensionsFromSVG(ele, Dimension.WIDTH),
          height: ele => extractDimensionsFromSVG(ele, Dimension.HEIGHT),
          'border-width': '2px',
          'border-color': 'steelblue'
        }
      },
      {
        selector: 'edge',
        css: {
          'line-color': '#ccc'
        }
      }
    ],
    layout: {
      name: 'dagre',
    }
  });
}

function extractDimensionsFromSVG(ele, type) {
  const dimensionInEX = ele.data().presentation.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
  const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
}

function registerEventListeners() {
  formulaAST.on('mouseover', 'node', (event) => {
    const nodeID = event.cyTarget.id();
    const escapedId = nodeID.replace(/\./g, '\\.');
    const mathJaxNode = document.querySelector(`#${escapedId}`);
    if (mathJaxNode) mathJaxNode.classList.add('highlight');
  });
}
