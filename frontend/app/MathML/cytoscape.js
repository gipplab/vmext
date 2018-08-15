'use strict';

const mml = require('mathml/app/MathML/MathMLRenderer');
const cytoscape = require('cytoscape');
const dagre = require('cytoscape-dagre');
const popper = require('cytoscape-popper');
const tippy = require('tippy.js');
const cxtmenu = require('cytoscape-cxtmenu');
const _ = require('lodash');

cytoscape.use(dagre);
cytoscape.use(popper);
cytoscape.use(cxtmenu);

function layout(cy) {
  if (!cy.headless()) {
    cy.elements().filter(e => e.visible()).layout({
      name: 'dagre',
      fit: true
    }).run();
  }

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
    return n.data() && n.data().name() === 'apply';
  }

  function isCs(n) {
    return n.data() && n.data().name() === 'cs';
  }

  function isCsymbol(n) {
    return n.data() && n.data().name() === 'csymbol';
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
    const oldLength = n.style(what);
    n.style(what, xSvg.attr(what));
    const eff = Math.max(n.numericStyle(what) * defaults.exScalingFactor, defaults.minNodeSize);
    n.style(what, eff);
    // log(`set dimension ${what} to ${xSvg.attr(what)} (${eff}px)`);
    if (eff > oldLength) {
      return true;
    } else {
      return false;
    }
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
            setDim(n, xSvg, 'width');
            setDim(n, xSvg, 'height');
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

  cy.startBatch();
  const applyNodes = cy.nodes().filter(isApply);

  function redraw() {
    cy.nodes().map(setBackground);
    applyNodes.forEach((a) => {
      const firstCy = getFirstChild(a);
      if (firstCy && firstCy.data().children().length === 0) {
        firstCy.on('click', (e) => {
          setApplyForm(a);
        });
        if (applyForm) {
          setApplyForm(a);
        }
      }
    });
  }

  if (!cy.headless()) {
    const csNodes = cy.nodes().filter(isCs);
    csNodes.forEach((n) => {
      const ref = n.popperRef(); // used only for positioning
      const cs = n.data()[0].textContent;
      const t = tippy(ref, {
        html: '#tooltipTemplate',
        onShow() {
          const content = this.querySelector('.tippy-content');
          content.innerHTML = cs;
        }
      }).tooltips[0];
      n.on('mouseover', () => t.show());
      n.on('mouseout', () => t.hide());

    });
    const csymbolNodes = cy.nodes().filter(isCsymbol);
    csymbolNodes.forEach((n) => {
      const ref = n.popperRef(); // used only for positioning
      const symbol = n.data()[0].textContent;
      const cd = 'wikidata';
      const t = tippy(ref, {
        html: '#tooltipTemplate',
        onShow() {
          const content = this.querySelector('.tippy-content');
          content.innerHTML = `Fetching information for symbol ${symbol} from content directory ${cd}.`;
          if (typeof fetch !== "undefined") {
            if (cd === 'wikidata') {
              // eslint-disable-next-line no-undef
              fetch(`http://www.wikidata.org/wiki/Special:EntityData/${symbol}.json`).then((res) => {
                res.json()
                  .then((json) => {
                    // language=HTML
                    content.innerHTML =
                      `<h3><a href="https://wikidata.org/wiki/${symbol}" target="_blank">
Wikidata ${symbol}</a></h3><p> ${_.get(json, `entities[${symbol}].labels.en.value`, symbol)} </p>
<p>${_.get(json, `entities[${symbol}].descriptions.en.value`, 'no description')} </p>`;
                  });
              })
                .catch((e) => {
                  console.error(e);
                  content.innerHTML = 'Loading failed';
                });
            }
          }

        }
      }).tooltips[0];
      n.on('mouseover', () => t.show());
      n.on('mouseout', () => t.hide());
    });
  }


  applyNodes.on('click', (e) => {
    cy.startBatch();
    const n = e.target;
    const expansion = n.data().expansion;
    if (expansion === 'collapsed') {
      n.data().expansion = false;
      const nodesToShow = n.successors(n => n.hidden());
      nodesToShow.data('expansion', false);
      nodesToShow.show();
      layout(cy);
    } else {
      n.data().expansion = 'collapsed';
      const nodesToHide = n.successors(n => n.visible());
      nodesToHide.hide();
    }
    setBackground(n);
    cy.endBatch();
  });
  // applyNodes.on('mouseover', onMouseOver);
  redraw();
  layout(cy);
  cy.endBatch();
  return cy;
};

module.exports.mml = mml;

module.exports.layout = layout;
