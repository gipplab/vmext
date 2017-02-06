'use strict';

let mergedAST;

window.addEventListener('message', paramsReveived, false);

function paramsReveived(event) {
  const eventData = event.data;
  if (eventData.isInitialData) {
    // this block is only executed for initialData postMessage from widget
    const attributes = event.data;
    fetchData(attributes)
      .then((result) => {
        renderAST(result);
        document.querySelector('.gif-loader').style.display = 'none';
      })
      .catch((err) => {
        document.querySelector('.gif-loader').style.display = 'none';
        document.querySelector('.main-cy-container').style.display = 'none';
        document.querySelector('.error-container').style.display = 'block';
        document.querySelector('.error-type').innerHTML = err.error;
        document.querySelector('.error-message').innerHTML = err.message;
        document.querySelector('.error-statuscode').innerHTML = err.statusCode;
        console.error(err);
      });
  } else {
    // this block handles postMessage events from both formula-ast-widgets
    // events can be "mouseOverNode" or "mouseOutNode"
    console.log(eventData);
    const node = mergedAST.$(`node[id='${eventData.nodeID}']`);
    eventData.type === 'mouseOverNode' ? highlightNode(node) : unhighlightNode(node);
  }
}

function fetchData({ reference_mathml, comparison_mathml, similarities }) {
  const formData = new FormData();
  formData.append('reference_mathml', reference_mathml);
  formData.append('comparison_mathml', comparison_mathml);
  formData.append('similarities', similarities);
  return fetch('http://math.citeplag.org/api/v1/math/renderMergedAST', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
    }),
    body: formData,
    referrerPolicy: 'no-referrer',
  }).then((response) => {
    return response.json().then((data) => {
      if (!response.ok) {
        return Promise.reject(data.Error.output.payload);
      }
      return data;
    });
  });
}

function renderAST({ cytoscapedMergedAST, cytoscapedReferenceAST, cytoscapedComparisonAST }) {
  mergedAST = cytoscape({
    container: document.querySelector('.merged-ast-container'),
    elements: cytoscapedMergedAST,
    style: [
      {
        selector: '.source-A',
        css: {
          shape: 'roundrectangle',
          'background-color': '#EDF1FA',
          'background-image': 'data(nodeSVG)',
          'background-fit': 'none',
          width: ele => extractDimensionsFromSVG(ele, Dimension.WIDTH),
          height: ele => extractDimensionsFromSVG(ele, Dimension.HEIGHT),
          'border-width': '2px'
        }
      },
      {
        selector: '.source-B',
        css: {
          shape: 'roundrectangle',
          'background-color': '#edfaf1',
          'background-image': 'data(nodeSVG)',
          'background-fit': 'none',
          width: ele => extractDimensionsFromSVG(ele, Dimension.WIDTH),
          height: ele => extractDimensionsFromSVG(ele, Dimension.HEIGHT),
          'border-width': '2px'
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
        }
      },
      {
        selector: 'edge',
        css: {
          'target-arrow-shape': 'triangle',
          'source-arrow-shape': 'triangle',
          'line-color': function(ele) {
            return (ele.data().type === 'match') ? 'RED' : '#ccc';
          }
        }
      }
    ],
    layout: {
      name: 'dagre',
      directed: true
    }
  });
}

function extractDimensionsFromSVG(ele, type) {
  const dimensionInEX = ele.data().nodeSVG.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
  const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
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
    { duration: 100 }
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
    { duration: 100 }
  );
}

function toggleErrorDeails() {
  document.querySelector('.error-details').classList.toggle('error-details--display');
}
