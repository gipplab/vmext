'use strict';

let formulaAST;
window.addEventListener('message', paramsReveived, false);

function paramsReveived(event) {
  fetchData(event.data)
    .then((result) => {
      document.querySelector('.formula-container').style.display = 'block';
      document.querySelector('.formula-container').innerHTML = decodeURIComponent(result.formulaSVG);
      renderAST(result.cytoscapedAST);
      registerEventListeners();
      document.querySelector('.gif-loader').style.display = 'none';
    })
    .catch((err) => {
      document.querySelector('.gif-loader').style.display = 'none';
      document.querySelector('.mainContainer').style.display = 'none';
      document.querySelector('.error-container').style.display = 'block';
      document.querySelector('.error-message').innerHTML = err.message;
      document.querySelector('.error-statuscode').innerHTML = err.statusCode;
      console.error(err);
    });
}

function fetchData({ mathml, collapseSingleOperandNodes, nodesToBeCollapsed }) {
  const formData = new FormData();
  formData.append('mathml', mathml);
  formData.append('collapseSingleOperandNodes', collapseSingleOperandNodes);
  formData.append('nodesToBeCollapsed', nodesToBeCollapsed);
  return fetch('http://math.citeplag.org/api/v1/math/renderAST?cytoscaped=true', {
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
          'background-image': 'data(nodeSVG)',
          'background-fit': 'none',
          width: ele => extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH),
          height: ele => extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.HEIGHT),
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

function extractDimensionsFromSVG(dataURI, type) {
  const dimensionInEX = dataURI.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
  const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
}

function registerEventListeners() {
  formulaAST.on('mouseover', 'node', (event) => {
    toggleFormulaHighlight(event.cyTarget.data().presentationID, true);

    const contentID = event.cyTarget.id();
    const node = formulaAST.$(`node[id='${contentID}']`);
    highlightNode(node);
  });

  formulaAST.on('mouseout', 'node', (event) => {
    toggleFormulaHighlight(event.cyTarget.data().presentationID, false);

    const contentID = event.cyTarget.id();
    const node = formulaAST.$(`node[id='${contentID}']`);
    unhighlightNode(node);
  });

  function toggleFormulaHighlight(id, addClass) {
    const escapedId = id.replace(/\./g, '\\.');
    const mathJaxNode = document.querySelector(`#${escapedId}`);
    if (mathJaxNode) {
      if (addClass) mathJaxNode.classList.add('highlight');
      else mathJaxNode.classList.remove('highlight');
    }
  }

  formulaAST.on('click', 'node', (event) => {
    const node = event.cyTarget;
    toggleFormulaHighlight(node.data().presentationID, false);
    if (node.data('removedEles')) {
      const nodeWidth = extractDimensionsFromSVG(node.data('nodeSVG'), Dimension.WIDTH);
      const nodeHeight = extractDimensionsFromSVG(node.data('nodeSVG'), Dimension.HEIGHT);
      node.style('background-image', node.data('nodeSVG'));
      node.style('width', nodeWidth);
      node.style('height', nodeHeight);
      node.data('oldWidth', nodeWidth);
      node.data('oldHeight', nodeHeight);
      node.data('removedEles').restore();
      formulaAST.layout({
        name: 'dagre',
        animate: true,
        animationDuration: 500,
      });
      node.removeData('removedEles');
    } else {
      const nodeWidth = extractDimensionsFromSVG(node.data('subtreeSVG'), Dimension.WIDTH);
      const nodeHeight = extractDimensionsFromSVG(node.data('subtreeSVG'), Dimension.HEIGHT);
      node.style('background-image', node.data('subtreeSVG'));
      node.style('width', nodeWidth);
      node.style('height', nodeHeight);
      node.data('oldWidth', nodeWidth);
      node.data('oldHeight', nodeHeight);
      const removedEles = formulaAST.remove(node.successors());
      node.data('removedEles', removedEles);
      formulaAST.layout({
        name: 'dagre',
        animate: true,
        animationDuration: 700,
      });
    }
  });
}

/*
** Animation Helper
*/
function highlightNode(node) {
  const newWidth = Math.floor(node.style('width').match('([0-9]*.[0-9]*)px')[1]) * defaults.nodeHoverScaling;
  const newHeight = Math.floor(node.style('height').match('([0-9]*.[0-9]*)px')[1]) * defaults.nodeHoverScaling;
  node.data('oldWidth', node.style('width'));
  node.data('oldHeight', node.style('height'));
  node.animate(
    {
      css: {
        width: newWidth,
        height: newHeight
      }
    },
    {
      duration: 100
    }
  );
}

function unhighlightNode(node) {
  node.animate(
    {
      css: {
        width: node.data('oldWidth'),
        height: node.data('oldHeight')
      }
    },
    {
      duration: 100
    }
  );
}

function showErrorDeails() {
  document.querySelector('.error-details').style.display = 'block';
}
