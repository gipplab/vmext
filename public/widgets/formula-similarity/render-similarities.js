'use strict';

window.addEventListener('message', paramsReveived, false);

function paramsReveived(event) {
  const attributes = event.data;
  fetchData(attributes)
    .then((result) => {
      renderAST(result);
      document.querySelector('.gif-loader').style.display = 'none';
      document.querySelector('.reference-ast-container').style['background-color']= '#EDF1FA';
      document.querySelector('.comparison-ast-container').style['background-color']= '#edfaf1';
    })
    .catch((err) => {
      document.querySelector('.gif-loader').style.display = 'none';
      document.querySelector('.gif-error').style.display = 'block';
      document.querySelector('body').style['background-color'] = '#101018';
      console.error(err);
    });
}

function fetchData({ reference_mathml, comparison_mathml, similarities }) {
  const formData = new FormData();
  formData.append('reference_mathml', reference_mathml);
  formData.append('comparison_mathml', comparison_mathml);
  formData.append('similarities', similarities);
  return fetch('http://math.citeplag.org/api/v1/math/renderMergedAST', {
    method: 'POST',
    headers: new Headers({
      'Accept': 'application/json',
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

function renderAST({cytoscapedMergedAST, cytoscapedReferenceAST, cytoscapedComparisonAST}) {
  const mergedAST = cytoscape({
    container: document.querySelector('.merged-ast-container'),
    elements: cytoscapedMergedAST,
    style: [
      {
        selector: '.source-A',
        css: {
          shape: 'roundrectangle',
          'background-color': '#EDF1FA',
          'background-image': 'data(presentation)',
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
          'background-image': 'data(presentation)',
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
  const referenceAST =  cytoscape({
    container: document.querySelector('.reference-ast-container'),
    elements: cytoscapedReferenceAST,
    style: [
      {
        selector: '.source-A',
        css: {
          shape: 'roundrectangle',
          'background-color': 'white',
          'background-image': 'data(presentation)',
          'background-fit': 'none',
          width: ele => extractDimensionsFromSVG(ele, Dimension.WIDTH),
          height: ele => extractDimensionsFromSVG(ele, Dimension.HEIGHT),
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
  const comparisonAST =  cytoscape({
    container: document.querySelector('.comparison-ast-container'),
    elements: cytoscapedComparisonAST,
    style: [
      {
        selector: '.source-A',
        css: {
          shape: 'roundrectangle',
          'background-color': 'white',
          'background-image': 'data(presentation)',
          'background-fit': 'none',
          width: ele => extractDimensionsFromSVG(ele, Dimension.WIDTH),
          height: ele => extractDimensionsFromSVG(ele, Dimension.HEIGHT),
          'border-width': '2px',
          'border-color': 'black'
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
      directed: true
    }
  });
}

function extractDimensionsFromSVG(ele, type) {
  const dimensionInEX = ele.data().presentation.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
  const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
}
