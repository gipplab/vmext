'use strict';

const mml = require('./MathMLRenderer');
const cytoscape = require('cytoscape');
const dagre = require('cytoscape-dagre');
const popper = require('cytoscape-popper');
const tippy = require('tippy.js');
const $ = require('jquery');

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
    const oldLength =  n.style(what);
    n.style(what, xSvg.attr(what));
    const eff = Math.max(n.numericStyle(what) * defaults.exScalingFactor,defaults.minNodeSize);
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
  cytoscape.use(dagre);
  cytoscape.use(popper);
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
        content.innerHTML  = `Fetching information for symbol ${symbol} from content directory ${cd}.`;
        if (typeof fetch !== "undefined") {
          // eslint-disable-next-line no-undef
          fetch(`/popupInfo/${cd}/${symbol}`).then((res) => {
            res.json()
              .then((json) => {
                content.innerHTML  = json.title;
              });
          })
            .catch((e) => {
              content.innerHTML = 'Loading failed';
            });
        }
      }
    }).tooltips[0];
    n.on('mouseover', () => t.show());
    n.on('mouseout', () => t.hide());

  });


  applyNodes.on('click',(e) => {
    cy.startBatch();
    const n = e.target;
    const expansion = n.data().expansion;
    if (expansion === 'collapsed') {
      n.data().expansion = false;
      const nodesToShow = n.successors(n => n.hidden());
      nodesToShow.data('expansion',false);
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


//
// formulaAST.elements().on('mouseover', (event) => {
//   const node = event.target;
//   if (node.hidden() || node.isEdge()) {
//     return;
//   }
//   const cd = node.data().cd;
//   const cs = node.data().cs;
//   if (cd) {
//     const symbol = node.data().symbol;
//     node.qtip({
//       content: {
//         text: (event, api) => {
//           const fallback = `Fetching information for symbol ${symbol} from content directory ${cd}.`;
//           $.ajax({
//             url: `/popupInfo/${cd}/${symbol}`,
//           })
//             .then((content) => {
//               api.set('content.text', content.text);
//               api.set('content.title', content.title);
//             }, (xhr, status, error) => {
//               // Upon failure... set the tooltip content to error
//               api.set('content.text', fallback + `Failed!`);
//             });
//
//           return fallback; // Set some initial text
//         },
//         title: `Fetching information for symbol ${symbol}`
//       },
//       show: {
//         event: 'mouseenter'
//       }
//     });
//     node.qtip('api').show();
//   } else if (cs) {
//     node.qtip({
//       content: {
//         text: cs
//       },
//       show: {
//         event: 'click mouseenter'
//       }
//     });
//     node.qtip('api').show();
//   }
//   sendMessageToParentWindow(event.target, 'mouseOverNode');
//   highlightNodeAndFormula({
//     nodeID: node.id(),
//     presentationID: node.data().presentationID,
//     nodeCollapsed: false,
//   });
//
// });
//
// formulaAST.elements().on('mouseout', (event) => {
//   const node = event.target;
//   if (node.hidden() || node.isEdge()) {
//     return;
//   }
//   currentMouseOverCytoNode = node;
//   const data = node.data();
//   if (data.cd || data.cs) {
//     const qtip = node.qtip('api');
//     qtip.hide();
//   }
//   sendMessageToParentWindow(event.target, 'mouseOutNode');
//   unhighlightNodeAndFormula({
//     nodeID: node.id(),
//     presentationID: node.data().presentationID,
//     nodeCollapsed: false
//   });
// });
//
// formulaAST.elements().on('click', (event) => {
//   const node = event.target;
//   if (node.hidden() || node.isEdge()) {
//     return;
//   }
//   sendMessageToParentWindow(event.target, 'mouseOutNode');
//
//   toggleFormulaHighlight(node.data().presentationID, false, node);
//   if (node.data('isCollapsed')) {
//     showChilds(node);
//     unhighlightNodeAndFormula({
//       nodeID: node.id(),
//       presentationID: node.data().presentationID,
//       nodeCollapsed: false
//     });
//     formulaAST.layout({
//       name: 'dagre',
//       animate: true,
//       animationDuration: defaults.animation.nodeCollapsing,
//       fit: formulaAST.zoom() === initialViewport.zoom, // only fit in original viewport
//     });
//   } else {
//     hideChilds(node);
//   }
// });
// mouseoverEventStream.subscribe((svgGroups) => {
//   if (activeFormulaElement) {
//     unhighlightNodeAndSuccessors(activeFormulaElement.cyNode);
//     activeFormulaElement.svgGroup.classList.remove('highlight');
//     sendMessageToParentWindow(activeFormulaElement.cyNode, 'mouseOutNode');
//   }
//   for (const svgGroup of svgGroups) {
//     const presentationId = svgGroup.getAttribute('id');
//     const cyNode = formulaAST.$(`node[presentationID='${presentationId}']`);
//     if (cyNode.length > 0 && cyNode.visible()) {
//       // this next block fixes an edgecase, where cytoscape node's mouseout wont be triggered otherwise
//       // if node is dragged underneath the top border of the cyto container and formula triggers mousever
//       if (currentMouseOverCytoNode) {
//         sendMessageToParentWindow(currentMouseOverCytoNode, 'mouseOutNode');
//         unhighlightNodeAndFormula({
//           nodeID: currentMouseOverCytoNode.id(),
//           presentationID: currentMouseOverCytoNode.data().presentationID,
//           nodeCollapsed: false
//         });
//       }
//
//       activeFormulaElement = { cyNode, svgGroup };
//       highlightNodeAndSuccessors(cyNode);
//       svgGroup.classList.add('highlight');
//       sendMessageToParentWindow(cyNode, 'mouseOverNode');
//       break;
//     }
//   }
// });
//
