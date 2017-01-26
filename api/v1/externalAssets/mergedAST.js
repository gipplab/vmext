'use strict';

/**
* ENUM declarations
**/
const Dimension = {
  WIDTH: 'width',
  HEIGHT: 'height',
}

const Origin = {
  REFERENCE_AST: 0,
  COMPARISON_AST: 1,
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
}
const mergedAST = cytoscape({
  container: document.querySelector('#mergedAST'),
  elements: MERGED_AST_TOKEN,
  style: [
    {
      selector: '.source-A',
      css: {
        shape: 'roundrectangle',
        'background-color': '#EDF1FA',
        'background-image': 'data(presentation)',
        'background-fit': 'none',
        width: function(ele) {
          return extractDimensionsFromSVG(ele, Dimension.WIDTH);
        },
        height: function(ele) {
          return extractDimensionsFromSVG(ele, Dimension.HEIGHT);
        },
        'border-width': '1px'
      }
    },
    {
      selector: '.source-B',
      css: {
        shape: 'roundrectangle',
        'background-color': '#edfaf1',
        'background-image': 'data(presentation)',
        'background-fit': 'none',
        width: function(ele) {
          return extractDimensionsFromSVG(ele, Dimension.WIDTH);
        },
        height: function(ele) {
          return extractDimensionsFromSVG(ele, Dimension.HEIGHT);
        },
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

const referenceAST =  cytoscape({
  container: document.querySelector('#referenceAST'),
  elements: REFERENCE_AST_TOKEN,
  style: [
    {
      selector: '.source-A',
      css: {
        shape: 'roundrectangle',
        'background-color': 'white',
        'background-image': 'data(presentation)',
        'background-fit': 'none',
        width: function(ele) {
          return extractDimensionsFromSVG(ele, Dimension.WIDTH);
        },
        height: function(ele) {
          return extractDimensionsFromSVG(ele, Dimension.HEIGHT);
        },
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
  elements: COMPARISON_AST_TOKEN,
  style: [
    {
      selector: '.source-A',
      css: {
        shape: 'roundrectangle',
        'background-color': 'white',
        'background-image': 'data(presentation)',
        'background-fit': 'none',
        width: function(ele) {
          return extractDimensionsFromSVG(ele, Dimension.WIDTH);
        },
        height: function(ele) {
          return extractDimensionsFromSVG(ele, Dimension.HEIGHT);
        },
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

/*
**  event listeners
*/
referenceAST.on('mouseover', 'node', function(event) {
  const nodeID = event.cyTarget.id();
  const node = referenceAST.$(`node[id='${nodeID}']`);
  const mouseOverNode = new CustomEvent('mouseOverNode',
  {
    detail: {
      origin: Origin.REFERENCE_AST,
      nodeID,
    }
  });
  window.dispatchEvent(mouseOverNode);
  highlightNode(node, defaults.color.referenceNodeHighlight);
});

referenceAST.on('mouseout', 'node', function(event) {
  const nodeID = event.cyTarget.id();
  const node = referenceAST.$(`node[id='${nodeID}']`);
  const mouseOutNode = new CustomEvent('mouseOutNode',
  {
    detail: {
      origin: Origin.REFERENCE_AST,
      nodeID,
    }
  });
  window.dispatchEvent(mouseOutNode);
  unhighlightNode(node, defaults.color.singleAST);
});

comparisonAST.on('mouseover', 'node', function(event) {
  const nodeID = event.cyTarget.id();
  const node = comparisonAST.$(`node[id='${nodeID}']`);
  const mouseOverNode = new CustomEvent('mouseOverNode',
  {
    detail: {
      origin: Origin.COMPARISON_AST,
      nodeID: event.cyTarget.id(),
    }
  });
  window.dispatchEvent(mouseOverNode);
  highlightNode(node, defaults.color.comparisonNodeHighlight);
});

comparisonAST.on('mouseout', 'node', function(event) {
  const nodeID = event.cyTarget.id();
  const node = comparisonAST.$(`node[id='${nodeID}']`);
  const mouseOutNode = new CustomEvent('mouseOutNode',
  {
    detail: {
      origin: Origin.COMPARISON_AST,
      nodeID,
    }
  });
  window.dispatchEvent(mouseOutNode);
  unhighlightNode(node, defaults.color.singleAST);
});


window.addEventListener('mouseOverNode', function(event) {
  const node = mergedAST.$(`node[id='${event.detail.nodeID}']`);
  const origin  = event.detail.origin;
  const color = (origin === Origin.REFERENCE_AST) ?
    defaults.color.referenceNodeHighlight :
    defaults.color.comparisonNodeHighlight;
  highlightNode(node, color);
});

window.addEventListener('mouseOutNode', function(event) {
  const node = mergedAST.$(`node[id='${event.detail.nodeID}']`);
  const origin  = event.detail.origin;
  const color = (origin === Origin.REFERENCE_AST) ?
    defaults.color.referenceNode :
    defaults.color.comparisonNode;
  unhighlightNode(node, color);
});

function extractDimensionsFromSVG(ele, type) {
  const dimensionInEX = ele.data().presentation.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
  const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
}

/*
** Animation Helper
*/
function highlightNode(node, color){
  const newWidth = Math.floor(node.style('width').match('([0-9]*.[0-9]*)px')[1]) * defaults.nodeHoverScaling;
  const newHeight = Math.floor(node.style('height').match('([0-9]*.[0-9]*)px')[1]) * defaults.nodeHoverScaling;
  node.data('oldWidth', node.style('width'));
  node.data('oldHeight', node.style('height'));
  node.animate(
    {
      css: {
        //backgroundColor: color,
        width: newWidth,
        height: newHeight
      }
    },
    {
      duration: 100
    }
  );
}

function unhighlightNode(node, color) {
  node.animate(
    {
      css: {
        //backgroundColor: color,
        width: node.data('oldWidth'),
        height: node.data('oldHeight')
      }
    },
    {
      duration: 100
    }
  );
}

/*
** Description Headers
**/
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
