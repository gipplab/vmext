// ENUM declarations
const Dimension = {
  WIDTH: 'width',
  HEIGHT: 'height',
}

const defaults = {
  minNodeSize: 30,
  exScalingFactor: 9,
  nodeHoverScaling: 1.2,
  color: {
    referenceNode: '#EDF1FA',
    referenceNodeHighlight: '#d5e1fd',
    comparisonNode: '#edfaf1',
    comparisonNodeHighlight: '#d6f5e0',
    singleAST: '#FFF',
  }
};

const queryParams = extractQueryParams();
fetchData(queryParams)
  .then((result) => {
    renderAST(result);
    document.querySelector('.gif-loader').style.display = 'none';
  })
  .catch((err) => {
    document.querySelector('.gif-loader').style.display = 'none';
    document.querySelector('.gif-error').style.display = 'block';
    document.querySelector('body').style['background-color'] = '#101018';
  });

function extractQueryParams() {
  const queryParams = new URLSearchParams(window.location.search);
  const mathml = queryParams.get('mathml');
  const collapseSingleOperandNodes = queryParams.get('collapseSingleOperandNodes');
  const nodesToBeCollapsed = queryParams.get('nodesToBeCollapsed');
  return {
    mathml,
    collapseSingleOperandNodes,
    nodesToBeCollapsed,
  }
}

function fetchData({ mathml, collapseSingleOperandNodes, nodesToBeCollapsed }) {
  const formData = new FormData();
  formData.append('mathml', mathml);
  formData.append('collapseSingleOperandNodes', collapseSingleOperandNodes);
  formData.append('nodesToBeCollapsed', nodesToBeCollapsed);
  return fetch('http://math.citeplag.org/api/v1/math/renderAST?cytoscaped=true', {
    method: 'POST',
    headers: new Headers({
      'Accept': 'application/json',
      'referer': 'vbb',
    }),
    body: formData
  }).then(handleFetchErrors)
  .then((data) => {
    return data.json();
  });
}

function renderAST(elements) {
  const formulaAST =  cytoscape({
    container: document.querySelector('.cy-container'),
    elements: elements,
    style: [
      {
        selector: '.source-A',
        css: {
          shape: 'roundrectangle',
          'background-color': 'white',
          'background-image': 'data(presentation)',
          'background-fit': 'none',
          width: (ele) => extractDimensionsFromSVG(ele, Dimension.WIDTH),
          height: (ele) => extractDimensionsFromSVG(ele, Dimension.HEIGHT),
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

function handleFetchErrors(response) {
  if (!response.ok) throw Error(response);
  return response;
}
