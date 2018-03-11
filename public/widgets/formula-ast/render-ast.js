/* eslint-disable no-param-reassign,jsdoc/require-param-type,no-undef */
/* global debounce cytoscape Dimension defaults Rx unhighlightNodeAndSuccessors highlightNodeAndSuccessors*/
/* eslint no-unused-expressions: ["error", { "allowTernary": true }]*/

'use strict';

/** @type cytoscape */
let formulaAST;
const initialViewport = {};
let initialAST;
let currentMouseOverCytoNode;
let formats;

function fetchData({ mathml, formulaIdentifier = 'A', widgetHost }) {
  const formData = new FormData();
  formData.append('mathml', mathml);
  return fetch(`${widgetHost}/api/v1/math/parseCytoscapedAST?formulaidentifier=${formulaIdentifier}`, {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
    }),
    referrerPolicy: 'no-referrer',
    body: formData
  }).then((response) => {
    return response.json().then((data) => {
      if (!response.ok) {
        return Promise.reject(data);
      }
      return data;
    });
  });
}

function extractDimensionsFromSVG(dataURI, type) {
  try {
    const dimensionInEX = dataURI.match(`${type}%3D%22([0-9]*\.[0-9]*)ex`)[1];
    const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
    return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
  } catch (e) {
    console.dir(dataURI);
    // eslint-disable-next-line no-console
    console.log(e);
    return defaults.minNodeSize;
  }
}


function isHeadNode(x) {
  return x.data('properties') &&
    ((x.data().properties.applyId || x.data().properties.applyParent));
}

function setDimFromSvg(svgData, n) {
  const nodeWidth = extractDimensionsFromSVG(svgData, Dimension.WIDTH);
  const nodeHeight = extractDimensionsFromSVG(svgData, Dimension.HEIGHT);
  n.style('width', nodeWidth);
  n.style('height', nodeHeight);
}

function setBackground(n) {
  const d = n.data();
  let svgData;
  if (d.isCollapsed) {
    svgData = d.subtreeSVG;
  } else if (d.applyForm) {
    svgData = d.applySVG;
  } else {
    svgData = d.nodeSVG;
  }
  setDimFromSvg(svgData, n);
  n.style('background-image', svgData);
}

function toggleFormulaHighlight(id, addClass, node) {
  const escapedId = id.replace(/\./g, '\\.');
  const mathJaxNode = document.querySelector(`#${escapedId}`);
  if (mathJaxNode) {
    const pos = node.data().pos;
    Object.keys(formats).forEach((f) => {
      if (addClass) {
        mathJaxNode.classList.add('highlight');
        const line = pos[f] || false;
        const cm = formats[f].cm || false;
        if (line && cm) {
          if (line.next) {
            formats[f].marker = cm.markText(line, line.next, { className: 'highlight' });
            cm.scrollIntoView({ from: line, to: line.next });
          } else {
            cm.getDoc().addLineClass(line.line, 'background', 'highlight');
            cm.scrollIntoView(line);
          }
        }
      } else {
        const line = pos[f] || false;
        const cm = formats[f].cm || false;
        const marker = formats[f].marker;
        if (line && cm) {
          cm.getDoc().removeLineClass(line.line, 'background', 'highlight');
        }
        if (marker) {
          marker.clear();
        }
        mathJaxNode.classList.remove('highlight');
      }
    });
  }
}

function unhighlightNodeAndFormula({ nodeID, presentationID, nodeCollapsed }) {
  const node = formulaAST.$(`node[id='${nodeID}']`);

  // unhighlight all successor nodes if collapsed node was hovered in similarities-widget
  nodeCollapsed ? unhighlightNodeAndSuccessors(node) : unhighlightNode(node);
  toggleFormulaHighlight(presentationID, false, node);
}

function renderAST(elements) {
  formulaAST = cytoscape({
    container: document.querySelector('.cy-container'),
    elements,
    style: [
      {
        selector: '.source-A,.source-B',
        css: {
          shape: 'roundrectangle',
          'background-color': 'white',
          'background-fit': 'none',
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
  const nodesToHide = formulaAST
     .filter(
       x => isHeadNode(x));
  nodesToHide.data('aplyForm', true);
  nodesToHide.on('style', (e) => {
    const n = e.target;
    const applyId = n.data('properties').applyId || false;
    if (applyId) {
      const ele = formulaAST.getElementById(`A.${applyId}`);
      if (n.visible()) {
        ele.data('applyForm', false);
      }
      setBackground(ele);
    } });

  nodesToHide.on('click', (e) => {
    const n = e.target;
    const applyId = n.data('properties').applyId || false;
    if (applyId) {
      const ele = formulaAST.getElementById(`A.${applyId}`);
      ele.data('applyForm',true);
      setBackground(ele);
      n.hide();
      unhighlightNodeAndFormula({
        nodeID: n.id(),
        presentationID: n.data().presentationID,
        nodeCollapsed: false
      });
    }
  });
  nodesToHide.hide();
  formulaAST.filter(n => n.isNode()).forEach(n => setBackground(n));
  formulaAST.layout({
    name: 'dagre',
    fit:true
  }).run();
  initialViewport.zoom = formulaAST.zoom();
  Object.assign(initialViewport, formulaAST.pan());

}

function createEventStreamFromElementArray(elements, type) {
  const observableArray = elements.map(ele => Rx.Observable.fromEvent(ele, type));
  const eventStream = Rx.Observable.merge(...observableArray);
  return eventStream
    .map(e => e.currentTarget)
    .filter(group => group.getBBox().width * group.getBBox().height > 0)
    .buffer(eventStream.debounce(1));
}


function highlightNodeAndFormula({ nodeID, presentationID, nodeCollapsed }) {
  const node = formulaAST.$(`node[id='${nodeID}']`);

  // highlight all successor nodes if collapsed node was hovered in similarities-widget
  nodeCollapsed ? highlightNodeAndSuccessors(node) : highlightNode(node);
  toggleFormulaHighlight(presentationID, true, node);
}

function sendMessageToParentWindow(node, type) {
  // pass node and all predecessor nodes to similarities-widget to also highlight collapsed nodes
  // to overcome circular references, the hiddenEles array is deleted on the clone object
  const nodes = node.predecessors().nodes().jsons();
  const clonedNode = node.json();
  nodes.forEach((ele) => {
    delete ele.data.hiddenEles;
  });
  delete clonedNode.data.hiddenEles;
  nodes.unshift(clonedNode);
  const eventData = {
    nodes,
    type,
  };
  window.parent.postMessage(eventData, '*');
}

function attachFormulaEventListeners() {
  const allSVGGroupsWithIds = Array.from(document.querySelectorAll('svg g[id]'));
  const mouseoverEventStream = createEventStreamFromElementArray(allSVGGroupsWithIds, 'mouseover');
  const mouseoutEventStream = createEventStreamFromElementArray(allSVGGroupsWithIds, 'mouseout');
  let activeFormulaElement;
  mouseoverEventStream.subscribe((svgGroups) => {
    if (activeFormulaElement) {
      unhighlightNodeAndSuccessors(activeFormulaElement.cyNode);
      activeFormulaElement.svgGroup.classList.remove('highlight');
      sendMessageToParentWindow(activeFormulaElement.cyNode, 'mouseOutNode');
    }
    for (const svgGroup of svgGroups) {
      const presentationId = svgGroup.getAttribute('id');
      const cyNode = formulaAST.$(`node[presentationID='${presentationId}']`);
      if (cyNode.length > 0 && cyNode.visible()) {
        // this next block fixes an edgecase, where cytoscape node's mouseout wont be triggered otherwise
        // if node is dragged underneath the top border of the cyto container and formula triggers mousever
        if (currentMouseOverCytoNode) {
          sendMessageToParentWindow(currentMouseOverCytoNode, 'mouseOutNode');
          unhighlightNodeAndFormula({
            nodeID: currentMouseOverCytoNode.id(),
            presentationID: currentMouseOverCytoNode.data().presentationID,
            nodeCollapsed: false
          });
        }

        activeFormulaElement = { cyNode, svgGroup };
        highlightNodeAndSuccessors(cyNode);
        svgGroup.classList.add('highlight');
        sendMessageToParentWindow(cyNode, 'mouseOverNode');
        break;
      }
    }
  });

  mouseoutEventStream.subscribe((svgGroups) => {
    for (const svgGroup of svgGroups) {
      const presentationId = svgGroup.getAttribute('id');
      const cyNode = formulaAST.$(`node[presentationID='${presentationId}']`);
      if (cyNode.length > 0 && cyNode.visible()) {
        unhighlightNodeAndSuccessors(cyNode);
        svgGroup.classList.remove('highlight');
        sendMessageToParentWindow(cyNode, 'mouseOutNode');
        break;
      }
    }
  });
}

/**
 *
 * @param {Element} node
 */
function hideChilds(node) {
  node.style('background-color', node.data('oldColor'));
  node.data('isCollapsed', true);
  setBackground(node);
  const nodesToHide = node.successors(n => n.visible());
  nodesToHide.hide();
  nodesToHide.animate({
    style: {
      'background-image-opacity': 0,
      opacity: 0,
    }
  }, { duration: defaults.animation.nodeCollapsing }
  );
  formulaAST.layout({
    name: 'dagre',
    animate: true,
    animationDuration: defaults.animation.nodeCollapsing,
    fit: formulaAST.zoom() === initialViewport.zoom, // only fit in original viewport
  });
}

function showChilds(node, recurse) {
  node.style('background-color', node.data('oldColor'));
  node.data('isCollapsed', false);
  setBackground(node);
  const hiddenEles = node.successors(n => n.hidden() && ((!isHeadNode(n) || n.data('applyForm'))));
  if (hiddenEles) {
    hiddenEles.show();
    hiddenEles.animate({
      style: {
        opacity: 1,
        'background-image-opacity': 1,
      },
      duration: defaults.animation.nodeCollapsing,
    });
  }
  if (recurse) {
    node.successors().forEach(ele => showChilds(ele, recurse));
  }
}

function registerEventListeners(cytoscapedAST) {
  attachFormulaEventListeners(cytoscapedAST);

  formulaAST.elements().on('mouseover', (event) => {
    const node = event.target;
    if (node.hidden() || node.isEdge()) {
      return;
    }
    const cd = node.data().cd;
    const cs = node.data().cs;
    if (cd) {
      const symbol = node.data().symbol;
      node.qtip({
        content: {
          text: (event, api) => {
            const fallback = `Fetching information for symbol ${symbol} from content directory ${cd}.`;
            $.ajax({
              url: `/popupInfo/${cd}/${symbol}`,
            })
              .then((content) => {
                api.set('content.text', content.text);
                api.set('content.title', content.title);
              }, (xhr, status, error) => {
                // Upon failure... set the tooltip content to error
                api.set('content.text', fallback + `Failed!`);
              });

            return fallback; // Set some initial text
          },
          title: `Fetching information for symbol ${symbol}`
        },
        show: {
          event: 'mouseenter'
        }
      });
      node.qtip('api').show();
    } else if (cs) {
      node.qtip({
        content: {
          text: cs
        },
        show: {
          event: 'click mouseenter'
        }
      });
      node.qtip('api').show();
    }
    sendMessageToParentWindow(event.target, 'mouseOverNode');
    highlightNodeAndFormula({
      nodeID: node.id(),
      presentationID: node.data().presentationID,
      nodeCollapsed: false,
    });

  });

  formulaAST.elements().on('mouseout', (event) => {
    const node = event.target;
    if (node.hidden() || node.isEdge()) {
      return;
    }
    currentMouseOverCytoNode = node;
    const data = node.data();
    if (data.cd || data.cs) {
      const qtip = node.qtip('api');
      qtip.hide();
    }
    sendMessageToParentWindow(event.target, 'mouseOutNode');
    unhighlightNodeAndFormula({
      nodeID: node.id(),
      presentationID: node.data().presentationID,
      nodeCollapsed: false
    });
  });

  formulaAST.elements().on('click', (event) => {
    const node = event.target;
    if (node.hidden() || node.isEdge()) {
      return;
    }
    sendMessageToParentWindow(event.target, 'mouseOutNode');

    toggleFormulaHighlight(node.data().presentationID, false, node);
    if (node.data('isCollapsed')) {
      showChilds(node);
      unhighlightNodeAndFormula({
        nodeID: node.id(),
        presentationID: node.data().presentationID,
        nodeCollapsed: false
      });
      formulaAST.layout({
        name: 'dagre',
        animate: true,
        animationDuration: defaults.animation.nodeCollapsing,
        fit: formulaAST.zoom() === initialViewport.zoom, // only fit in original viewport
      });
    } else {
      hideChilds(node);
    }
  });
}

/**
 * EventListener for postMessage-iframe-events (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
 * Events can be of two types:
 *  1. intitialData - contains attributes attached to original widget <script>-Tag for initialistion
 *  2. hover information: either mouseover or mouseout from another widget for highlighting purposes
 */
function paramsReveived(event) {

  const eventData = event.data;
  formats = event.source.formats;
  if (eventData.isInitialData) {
    fetchData(eventData)
      .then((result) => {
        initialAST = JSON.parse(JSON.stringify(result.cytoscapedAST));
        document.body.dispatchEvent(new Event('rendered'));
        document.querySelector('.formula-container').style.display = 'block';
        document.querySelector('.formula-container').innerHTML = decodeURIComponent(result.formulaSVG);
        const presentations = {};
        result.cytoscapedAST.forEach((x) => {
          const properties = x.data.properties || false;
          if (properties && properties.applyId) {
            presentations[x.data.id] = x.data.subtreeSVG || x.data.nodeSVG;
          }
        });
        result.cytoscapedAST = result.cytoscapedAST.map((x) => {
          const properties = x.data.properties || false;
          if (properties && properties.firstChild) {
            x.data.applyForm = true;
            x.data.applySVG = presentations[`${x.data.source}.${properties.firstChild}`] || x.data.nodeSVG;
          }
          return x;
        });
        renderAST(result.cytoscapedAST);
        registerEventListeners(result.cytoscapedAST);
        document.querySelector('body').style['background-color'] = eventData.bgColor;
        document.querySelector('.gif-loader').style.display = 'none';
        document.querySelector('.viewport-reset').style.visibility = 'visible';
        document.querySelector('.ast-reload').style.visibility = 'visible';
      })
      .catch((err) => {
        document.querySelector('.gif-loader').style.display = 'none';
        document.querySelector('.mainContainer').style.display = 'none';
        document.querySelector('.error-container').style.display = 'block';
        document.querySelector('.error-type').innerHTML = err.error;
        document.querySelector('.error-message').innerHTML = err.message;
        document.querySelector('.error-statuscode').innerHTML = err.statusCode;
        // eslint-disable-next-line no-console
        console.error(err);
      });
  } else if (formulaAST) {
    const node = formulaAST.$(`node[id='${eventData.nodeID}']`);
    eventData.type === 'mouseOverNode' ? highlightNodeAndFormula(eventData) : unhighlightNodeAndFormula(eventData);
  }
}


function resetViewport() {
  formulaAST.layout({
    name: 'dagre',
    fit: true,
  });
}

function layout() {
  formulaAST.layout({
    name: 'dagre',
    fit: true,
  }).run();
}

function expandAllNodes() {
  formulaAST.filter(n => n.isNode()).forEach((n) => {
    n.data('applyForm',true);
    n.data('isCollapsed',false);
    setBackground(n);
  }
  );
  formulaAST.elements().show();
  layout();
}

window.addEventListener('message', paramsReveived, false);

window.addEventListener('resize', debounce(() => {
  if (formulaAST) {
    formulaAST.layout({
      name: 'dagre',
      fit: true,
    });
  }
}, 40));
