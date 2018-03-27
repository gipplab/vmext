'use strict';

const mml = require('./MathMLRenderer');
const cytoscape = require('cytoscape');

mml.base.prototype.toCytoscape = function(options = {}) {
  const elements = [];
  let applyForm = false;

  function addNode(elements, n) {
    elements.push({
      group: 'nodes',
      data: n,
      style:{
        'background-image': n.imgUrl(),
      },
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
  if (options.applyForm) {
    applyForm = options.applyForm;
    delete options.applyForm;
  }

  this._addCTreeElements(elements, addNode, addEdge);
  Object.assign(options, { elements });
  const cy = cytoscape(options);

  const applyNodes = cy.nodes().filter(isApply);

  function getFirstChild(a) {
    const firstX = a.data().children().first();
    if (firstX.length) {
      return cy.getElementById(firstX.id);
    } else {
      return false;
    }
  }

  function setApplyForm(a) {
    a.data().expansion = 'first';
    a.style('background-image', a.data().imgUrl());
    getFirstChild(a).hide();
  }

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
    } else {
      n.data().expansion = 'collapsed';
      const nodesToHide = n.successors(n => n.visible());
      nodesToHide.hide();
    }
    n.style('background-image', n.data().imgUrl());
  });
  return cy;
};

module.exports = mml;

