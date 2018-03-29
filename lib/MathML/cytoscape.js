'use strict';

const mml = require('./MathMLRenderer');
const cytoscape = require('cytoscape');

function layout(cy) {
  cy.elements().filter(e => e.visible()).layout({
    name: 'dagre',
    fit: true
  }).run();
}

mml.base.prototype.toCytoscape = function(options = {}) {
  const defaults = {
    exScalingFactor: 12,
    minNodeSize: 30,
  };
  const elements = [];
  let applyForm = false;

  function addNode(elements, n) {
    elements.push({
      group: 'nodes',
      data: n,
      classes: 'top-center'
    });
  }

  function addEdge(elements, child, parent) {
    elements.push({
      group: 'edges',
      data: {
        source: parent.id,
        target: child.id
      },
      classes: 'hierarchy'
    });
  }

  function isApply(n) {
    return n.data() || n.data()[0].name() === 'apply';
  }

  function getFirstChild(a) {
    const firstX = a.data().children().first();
    if (firstX.length) {
      return a.cy().getElementById(firstX.id);
    } else {
      return false;
    }
  }

  function setDim(n, xSvg, what) {
    n.style(what, xSvg.attr(what));
    const eff = Math.max(n.numericStyle(what) * defaults.exScalingFactor,defaults.minNodeSize);
    n.style(what, eff);
    // log(`set dimension ${what} to ${xSvg.attr(what)} (${eff}px)`);
  }

  function setBackground(n) {
    const imgUrl = n.data().imgUrl();
    n.style('background-image', imgUrl);
    // eslint-disable-next-line no-undef
    // while one could use isomorphic fetch, one does not need the svg dimensions in a headless environment
    if (typeof fetch !== "undefined") {
      // eslint-disable-next-line no-undef
      fetch(imgUrl).then((res) => {
        res.text()
          .then((t) => {
            const xSvg = mml(t);
            setDim(n, xSvg,'width');
            setDim(n, xSvg,'height');
          });
      });
    }

  }

  function setApplyForm(a) {
    a.data().expansion = 'first';
    a.style('background-image', a.data().imgUrl());
    getFirstChild(a).hide();
  }

  if (options.applyForm) {
    applyForm = options.applyForm;
    delete options.applyForm;
  }

  this._addCTreeElements(elements, addNode, addEdge);
  Object.assign(options, { elements });
  const cy = cytoscape(options);
  const applyNodes = cy.nodes().filter(isApply);
  cy.nodes().map(n => setBackground(n));
  applyNodes.forEach((a) => {
    const firstCy = getFirstChild(a);
    if (firstCy && firstCy.data().children().length === 0) {
      firstCy.on('click' ,(e) => {
        setApplyForm(a);
      });
      if (applyForm) {
        setApplyForm(a);
      }
    }
  });

  applyNodes.on('click',(e) => {
    const n = e.target;
    const expansion = n.data().expansion;
    if (expansion === 'collapsed') {
      n.data().expansion = false;
      const nodesToShow = n.successors(n => n.hidden());
      nodesToShow.show();
      layout(cy);
    } else {
      n.data().expansion = 'collapsed';
      const nodesToHide = n.successors(n => n.visible());
      nodesToHide.hide();
    }
    setBackground(n);

  });
  return cy;
};

module.exports.mml = mml;

module.exports.layout = layout;

