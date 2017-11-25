'use strict';

/* eslint-env browser */
/* eslint-disable no-unused-vars */
/* global defaults, cytoscape, cy, Dimension */

function extractDimensionsFromSVG(ele, type) {
  const dimensionInEX = ele.match(type + '%3D%22([0-9]*.[0-9]*)ex')[1];
  const dimensionInPX = dimensionInEX * defaults.exScalingFactor;
  return dimensionInPX > defaults.minNodeSize ? dimensionInPX : defaults.minNodeSize;
}

function setDimensions(width, height) {
  const container = window.document.getElementById('cy-container');
  container.style.width = width + 'px';
  container.style.height = height + 'px';
}

// replacing ex units with pixels to overcome phantom rendering issues
function transformSVGToPixelUnits(svg) {
  const widthInEXUnit = svg.match('width%3D%22([0-9]*.[0-9]*)ex')[1];
  const heightInEXUnit = svg.match('height%3D%22([0-9]*.[0-9]*)ex')[1];
  let svgData = svg.replace(/width%3D%22[0-9]*.[0-9]*ex/, 'width%3D%22' + widthInEXUnit * 9 + 'px');
  svgData = svgData.replace(/height%3D%22[0-9]*.[0-9]*ex/, 'height%3D%22' + heightInEXUnit * 9 + 'px');
  return svgData;
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
          'background-image'(ele) { return transformSVGToPixelUnits(ele.data('nodeSVG')); },
          'background-fit': 'none',
          width(ele) { return extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.WIDTH); },
          height(ele) { return extractDimensionsFromSVG(ele.data('nodeSVG'), Dimension.HEIGHT); },
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
  cy.on('layoutstop', () => {
    if (typeof window.callPhantom === 'function') {
      window.callPhantom();
    }
  });
  cy.layout({ name: 'dagre' });
  return window.cy;
}
