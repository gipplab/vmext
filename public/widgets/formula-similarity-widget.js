// iife - to encapsulate scope
(function(){

  // ENUM declarations
  var Dimension = {
    WIDTH: 'width',
    HEIGHT: 'height',
  }

  var defaults = {
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

  var script = document.currentScript;
  loadVendorScripts(script); // fetch cytoscape and dagre-layout bundle

  function loadVendorScripts(script) {
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.setAttribute('src', 'http://math.citeplag.org/widgets/cytoscape-dagre-bundle.min.js');
    scriptTag.onload = onVendorScriptsLoaded.bind(this, script);
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
  }

  function createCyContainers() {
    var mainCYContainer = document.createElement('div');
    mainCYContainer.style.width = '100%';
    mainCYContainer.style.height = '100%';
    mainCYContainer.classList.add('main-cy-container');

    var gifLoader = document.createElement('img');
    gifLoader.classList.add('gif-loader');
    gifLoader.style.position = 'absolute';
    gifLoader.style.top = '50%';
    gifLoader.style.left = '50%';
    gifLoader.style['margin-top'] = '-79px';
    gifLoader.style['margin-left'] = '-79px';
    gifLoader.src = 'http://math.citeplag.org/assets/ring.gif';

    mainCYContainer.appendChild(gifLoader);
    var flexContainer = document.createElement('div');
    flexContainer.style.width = '100%';
    flexContainer.style.height = '40%';
    flexContainer.style.display = 'flex';
    flexContainer.classList.add('flex-container');

    var referenceASTContainer = document.createElement('div');
    referenceASTContainer.style.width = '50%';
    referenceASTContainer.style.height = '100%';
    referenceASTContainer.classList.add('reference-ast-container');

    var comparisonASTContainer = document.createElement('div');
    comparisonASTContainer.style.width = '50%';
    comparisonASTContainer.style.height = '100%';
    comparisonASTContainer.classList.add('comparison-ast-container');

    var mergedASTContainer = document.createElement('div');
    mergedASTContainer.style.width = '100%';
    mergedASTContainer.style.height = '60%';
    mergedASTContainer.classList.add('merged-ast-container');

    flexContainer.appendChild(referenceASTContainer);
    flexContainer.appendChild(comparisonASTContainer);
    mainCYContainer.appendChild(flexContainer);
    mainCYContainer.appendChild(mergedASTContainer);

    return mainCYContainer;
  }

  function onVendorScriptsLoaded(script) {
    var container = createCyContainers();
    script.parentNode.replaceChild(container, script);
    var formData = new FormData();
    formData.append('reference_mathml', script.getAttribute('reference_mathml'));
    formData.append('comparison_mathml', script.getAttribute('comparison_mathml'));
    formData.append('similarities', script.getAttribute('similarities'));
    fetch('http://math.citeplag.org/api/v1/math/renderMergedAst', {
      method: 'POST',
      headers: new Headers({
        'Accept': 'application/json',
      }),
      body: formData
    }).then(function(data) {
      return data.json();
    }).then(function(result) {
      renderAST(result);
      document.querySelector('.gif-loader').style.display = 'none';
      document.querySelector('.reference-ast-container').style['background-color']= '#EDF1FA';
      document.querySelector('.comparison-ast-container').style['background-color']= '#edfaf1';
    }).catch(function(err) {
      console.error(err);
    });
  }

  function renderAST({cytoscapedMergedAST, cytoscapedReferenceAST, cytoscapedComparisonAST}) {
    var mergedAST = cytoscape({
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
            width: function(ele) {
              return extractDimensionsFromSVG(ele, Dimension.WIDTH);
            },
            height: function(ele) {
              return extractDimensionsFromSVG(ele, Dimension.HEIGHT);
            },
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
            width: function(ele) {
              return extractDimensionsFromSVG(ele, Dimension.WIDTH);
            },
            height: function(ele) {
              return extractDimensionsFromSVG(ele, Dimension.HEIGHT);
            },
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
    var referenceAST =  cytoscape({
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
            width: function(ele) {
              return extractDimensionsFromSVG(ele, Dimension.WIDTH);
            },
            height: function(ele) {
              return extractDimensionsFromSVG(ele, Dimension.HEIGHT);
            },
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
    var dimensionInEX = ele.data().presentation.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
    var dimensioninPX = dimensionInEX * defaults.exScalingFactor;
    return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
  }

})(); // iife end
