function extractDimensionsFromSVG(ele, type) {
  const dimensionInEX = ele.data().nodeSVG.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
  const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
}

window.beginCyto = function (cytoNodes) {
  return cytoscape({
    container: window.document.getElementById('cy-container'),
    headless: false,
    elements: cytoNodes,
    style: [
      {
        selector: '.source-A,.source-B',
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
    ],
    pixelRatio: 1,
    layout: {
      name: 'dagre'
    }
  });
};
