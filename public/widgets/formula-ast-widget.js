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

  function onVendorScriptsLoaded(script) {
    var container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.classList.add('cy-container');

    var gifLoader = document.createElement('img');
    gifLoader.classList.add('gif-loader');
    gifLoader.style.position = 'absolute';
    gifLoader.style.top = '50%';
    gifLoader.style.left = '50%';
    gifLoader.style['margin-top'] = '-79px';
    gifLoader.style['margin-left'] = '-79px';
    gifLoader.src = 'http://math.citeplag.org/assets/ring.gif';

    container.appendChild(gifLoader);
    script.parentNode.replaceChild(container, script);
    var formData = new FormData();
    formData.append('mathml', script.getAttribute('mathml'));
    formData.append('collapseSingleOperandNodes', script.getAttribute('collapseSingleOperandNodes'));
    formData.append('nodesToBeCollapsed', script.getAttribute('nodesToBeCollapsed'));
    fetch('http://math.citeplag.org/api/v1/math/renderAST?cytoscaped=true', {
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
    }).catch(function(err) {
      console.error(err);
    });
  }

  function renderAST(elements) {
    var referenceAST =  cytoscape({
      container: document.querySelector('.cy-container'),
      elements: elements,
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
  }

  function extractDimensionsFromSVG(ele, type) {
    var dimensionInEX = ele.data().presentation.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
    var dimensioninPX = dimensionInEX * defaults.exScalingFactor;
    return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
  }

})(); // iife end
