
function extractDimensionsFromSVG(ele, type) {
  var dimensionInEX = ele.match(type + '%3D%22([0-9]*.[0-9]*)ex')[1];
  var dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
}

function extractBgDimensionsFromSVG(ele, type) {
  var dimensionInEX = ele.match(type + '%3D%22([0-9]*.[0-9]*)ex')[1];
  return dimensionInEX * defaults.exScalingFactor;
}

function setDimensions(width, height) {
  var container = window.document.getElementById('cy-container');
  container.style.width = width + 'px';
  container.style.height = height + 'px';
}

window.cy = null;
function beginCyto(cytoNodes) {
  window.cy = cytoscape({
    container: document.getElementById('cy-container'),
    elements: cytoNodes,
    style: [
      {
        selector: '.source-A',
        css: {
          shape: 'roundrectangle',
          'background-color': defaults.color.referenceNode,
          'background-image': 'data(nodeSVG)',
          'background-width': function(ele) {
            return extractBgDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH);
          },
          'background-height': function(ele) {
            return extractBgDimensionsFromSVG(ele.data('nodeSVG'), Dimension.HEIGHT);
          },
          'background-position-x': function(ele) {
            var wTotal = extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH);
            var wText = extractBgDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH);
            return wTotal/2 - wText/2 + 1;
          },
          'background-fit': 'none',
          width: function(ele) { return extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH); },
          height: function(ele) { return extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.HEIGHT); },
          'border-width': defaults.borderWidth
        }
      },
      {
        selector: '.source-B',
        css: {
          shape: 'roundrectangle',
          'background-color': defaults.color.comparisonNode,
          'background-image': 'data(nodeSVG)',
          'background-width': function(ele) {
            return extractBgDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH);
          },
          'background-height': function(ele) {
            return extractBgDimensionsFromSVG(ele.data('nodeSVG'), Dimension.HEIGHT);
          },
          'background-position-x': function(ele) {
            var wTotal = extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH);
            var wText = extractBgDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH);
            return wTotal/2 - wText/2 + 1;
          },
          'background-fit': 'none',
          width: function(ele) { return extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH); },
          height: function(ele) { return extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.HEIGHT); },
          'border-width': defaults.borderWidth
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

  cy.on('layoutstop', function() {
    if (typeof window.callPhantom === 'function') {
      window.callPhantom();
    }
  });
  cy.layout({ name: 'dagre' });
  return window.cy;
}
