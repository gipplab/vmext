'use strict';

let mergedAST;

window.addEventListener('message', paramsReveived, false);

function paramsReveived(event) {
  const eventData = event.data;
  if (eventData.isInitialData) {
    // this block is only executed for initialData postMessage from widget
    const attributes = event.data;
    appendASTWidgets(attributes);
    fetchData(attributes)
      .then((result) => {
        renderAST(result);
        registerEventListeners();
        document.querySelector('.gif-loader').style.display = 'none';
        document.querySelector('.main-cy-container').style.visibility = 'visible';
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
    // events.data holds an array with the node and all its predecessors to be able to highlight even collapsed nodes
    console.log(eventData);

    for (const node of eventData.nodes) {
      const mergedCyNode = mergedAST.$(`node[id='${node.data.id}']`);
      // debugger;
      if (mergedCyNode.length !== 0) {
        eventData.type === 'mouseOverNode' ? highlightNode(mergedCyNode) : unhighlightNode(mergedCyNode);
        break;
      }
    }
  }
}

/**
** since formula-ast-widget could pass nodes to highlight, that are collapsed
** we need to recursively go up its predecessors to find the right node to highlight
**/
// function *recursivelyFindNodetoHighlight(nodes) {
//   node.forEach((node) => {
//     yield node.data.nodeID;
//   });
// }

function appendASTWidgets(attributes) {
  const referenceASTWidget = document.createElement('script');
  referenceASTWidget.setAttribute('type', 'application/javascript');
  referenceASTWidget.setAttribute('src', '/widgets/formula-ast-widget.js');
  referenceASTWidget.setAttribute('mathml', attributes.reference_mathml);
  referenceASTWidget.setAttribute('collapseSingleOperandNodes', false);
  referenceASTWidget.setAttribute('nodesToBeCollapsed', '[""]');
  referenceASTWidget.setAttribute('bgColor', '#edf1fa');
  referenceASTWidget.setAttribute('formulaIdentifier', 'A');

  const comparisonASTWidget = document.createElement('script');
  comparisonASTWidget.setAttribute('type', 'application/javascript');
  comparisonASTWidget.setAttribute('src', '/widgets/formula-ast-widget.js');
  comparisonASTWidget.setAttribute('mathml', attributes.comparison_mathml);
  comparisonASTWidget.setAttribute('collapseSingleOperandNodes', false);
  comparisonASTWidget.setAttribute('nodesToBeCollapsed', '[""]');
  comparisonASTWidget.setAttribute('bgColor', '#edfaf1');
  comparisonASTWidget.setAttribute('formulaIdentifier', 'B');

  const referenceContainer = document.querySelector('.reference-ast-container');
  const comparisonContainer = document.querySelector('.comparison-ast-container');
  referenceContainer.appendChild(referenceASTWidget);
  comparisonContainer.appendChild(comparisonASTWidget);
}

function fetchData({ reference_mathml, comparison_mathml, similarities }) {
  const formData = new FormData();
  formData.append('reference_mathml', reference_mathml);
  formData.append('comparison_mathml', comparison_mathml);
  formData.append('similarities', similarities);
  return fetch('http://localhost:4001/api/v1/math/renderMergedAST', {
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

function registerEventListeners() {
  mergedAST.on('mouseover', 'node', (event) => {
    const node = event.cyTarget;
    const eventData = {
      nodeID: node.id(),
      presentationID: node.data().presentationID,
      type: 'mouseOverNode',
      nodeCollapsed: node.hasClass('collapse'),
    };
    const iframes = document.querySelectorAll('iframe');
    if (event.cyTarget.hasClass('match-identical')) {
      iframes[0].contentWindow.postMessage(eventData, '*');
      eventData.nodeID = node.data('source-B-id');
      iframes[1].contentWindow.postMessage(eventData, '*');
      highlightNode(node);
    } else if (event.cyTarget.data('label') !== 'Similar') {
        const target = eventData.nodeID.substring(0, 1) === 'A' ? iframes[0] : iframes[1];
        target.contentWindow.postMessage(eventData, '*');
        highlightNode(node);
    }
  });

  mergedAST.on('mouseout', 'node', (event) => {
    const node = event.cyTarget;
    const eventData = {
      nodeID: node.id(),
      presentationID: node.data().presentationID,
      type: 'mouseOutNode',
      nodeCollapsed: node.hasClass('collapse'),
    };
    const iframes = document.querySelectorAll('iframe');
    if (event.cyTarget.hasClass('match-identical')) {
      iframes[0].contentWindow.postMessage(eventData, '*');
      eventData.nodeID = node.data('source-B-id');
      iframes[1].contentWindow.postMessage(eventData, '*');
      unhighlightNode(node);
    } else if ((event.cyTarget.data('label') !== 'Similar')) {
        const target = eventData.nodeID.substring(0, 1) === 'A' ? iframes[0] : iframes[1];
        target.contentWindow.postMessage(eventData, '*');
        unhighlightNode(node);
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
