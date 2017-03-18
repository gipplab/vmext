
function extractDimensionsFromSVG(ele, type) {
  var dimensionInEX = ele.match(type + '%3D%22([0-9]*.[0-9]*)ex')[1];
  var dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
}

function setDimensions(width, height) {
  var container = window.document.getElementById('cy-container');
  container.style.width = width + 'px';
  container.style.height = height + 'px';
}

// replacing ex units with pixels to overcome phantom rendering issues
function transformSVGToPixelUnits(svgdata) {
  const widthInEXUnit = svgdata.match('width%3D%22([0-9]*.[0-9]*)ex')[1];
  const heightInEXUnit = svgdata.match('height%3D%22([0-9]*.[0-9]*)ex')[1];
  svgdata = svgdata.replace(/width%3D%22[0-9]*.[0-9]*ex/, 'width%3D%22' + widthInEXUnit * 9 + 'px');
  svgdata = svgdata.replace(/height%3D%22[0-9]*.[0-9]*ex/, 'height%3D%22' + heightInEXUnit * 9 + 'px');
  return svgdata;
}

window.cy = null;
function beginCyto(cytoNodes) {
  window.cy = cytoscape({
    container: window.document.getElementById('cy-container'),
    headless: false,
    elements: cytoNodes,
    style: [
      {
        selector: '.source-A,.source-B',
        css: {
          shape: 'roundrectangle',
          'background-color': 'white',
          'background-image': function (ele) { return transformSVGToPixelUnits(ele.data('nodeSVG')); },
          'background-fit': 'none',
          width: function(ele) { return extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH); },
          height: function(ele) { return extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.HEIGHT); },
          'border-width': '2px',
          'border-color': 'steelblue'
        }
      },
      {
        selector: '.ambiguous',
        css: {
          'border-color': 'steelblue',
          'border-style': 'dashed'
        }
      },
      {
        selector: 'edge',
        css: {
          'line-color': '#ccc'
        }
      },
    ]
  });
  cy.on('layoutstop', function() {
    if (typeof window.callPhantom === 'function') {
      window.callPhantom();
    }
  });
  cy.layout({ name: 'dagre' });
  return window.cy;
}
