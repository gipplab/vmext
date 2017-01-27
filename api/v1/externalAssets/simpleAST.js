/**
* ENUM declarations
**/
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
}

const referenceAST =  cytoscape({
  container: document.querySelector('#renderedAST'),
  elements: AST_TOKEN,
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

function extractDimensionsFromSVG(ele, type) {
  const dimensionInEX = ele.data().presentation.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
  const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
}
