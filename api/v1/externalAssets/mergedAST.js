'use strict';

const Dimension = {
  WIDTH: 'width',
  HEIGHT: 'height',
}

const extractDimensionsFromSVG = function(ele, type) {
  const dimensionInEX = ele.data().presentation.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
  const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
}
const defaults = {
  minNodeSize: 30,
  exScalingFactor: 9,
  nodeHoverScaling: 1.2
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


// event listeners
referenceAST.on('mouseover', 'node', function(event) {
  const mouseOverNode = new CustomEvent('mouseOverNode',
  {
    detail: {
      node: event.cyTarget.id(),
    }
  });
  window.dispatchEvent(mouseOverNode);
});

referenceAST.on('mouseout', 'node', function(event) {
  const mouseOutNode = new CustomEvent('mouseOutNode',
  {
    detail: {
      node: event.cyTarget.id(),
    }
  });
  window.dispatchEvent(mouseOutNode);
});

comparisonAST.on('mouseover', 'node', function(event) {
  const mouseOverNode = new CustomEvent('mouseOverNode',
  {
    detail: {
      node: event.cyTarget.id(),
    }
  });
  window.dispatchEvent(mouseOverNode);
});

comparisonAST.on('mouseout', 'node', function(event) {
  const mouseOutNode = new CustomEvent('mouseOutNode',
  {
    detail: {
      node: event.cyTarget.id(),
    }
  });
  window.dispatchEvent(mouseOutNode);
});


window.addEventListener('mouseOverNode', function(event) {
  const node = mergedAST.$(`node[id='${event.detail.node}']`);
  const newWidth = Math.floor(node.style('width').match('([0-9]*.[0-9]*)px')[1]) * defaults.nodeHoverScaling;
  const newHeight = Math.floor(node.style('height').match('([0-9]*.[0-9]*)px')[1]) * defaults.nodeHoverScaling;
  node.data('oldColor', node.style('background-color'));
  node.data('oldWidth', node.style('width'));
  node.data('oldHeight', node.style('height'));
  node.animate(
    {
      css: {
        backgroundColor: '#fdfa1b',
        width: newWidth,
        height: newHeight
      }
    },
    {
      duration: 100
    }
  );
});

window.addEventListener('mouseOutNode', function(event) {
  const node = mergedAST.$(`node[id='${event.detail.node}']`);
  node.animate(
    {
      css: {
        backgroundColor: node.data('oldColor'),
        width: node.data('oldWidth'),
        height: node.data('oldHeight')
      }
    },
    {
      duration: 100
    }
  );
});


// Description Headers
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
