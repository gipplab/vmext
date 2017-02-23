'use strict';

let formulaAST;
window.addEventListener('message', paramsReveived, false);

/**
 * EventListener for postMessage-iframe-events (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
 * Events can be of two types:
 *  1. intitialData - contains attributes attached to original widget <script>-Tag for initialistion
 *  2. hover information: either mouseover or mouseout from another widget for highlighting purposes
 */
function paramsReveived(event) {
  const eventData = event.data;
  if (eventData.isInitialData) {
    fetchData(eventData)
      .then((result) => {
        document.querySelector('.formula-container').style.display = 'block';
        document.querySelector('.formula-container').innerHTML = decodeURIComponent(result.formulaSVG);
        renderAST(result.cytoscapedAST);
        registerEventListeners(result.cytoscapedAST);
        document.querySelector('body').style['background-color'] = eventData.bgColor;
        document.querySelector('.gif-loader').style.display = 'none';
      })
      .catch((err) => {
        document.querySelector('.gif-loader').style.display = 'none';
        document.querySelector('.mainContainer').style.display = 'none';
        document.querySelector('.error-container').style.display = 'block';
        document.querySelector('.error-type').innerHTML = err.error;
        document.querySelector('.error-message').innerHTML = err.message;
        document.querySelector('.error-statuscode').innerHTML = err.statusCode;
        console.error(err);
      });
  } else {
    console.log(eventData);
    const node = formulaAST.$(`node[id='${eventData.nodeID}']`);
    eventData.type === 'mouseOverNode' ?
      highlightNodeAndFormula(eventData) :
      unhighlightNodeAndFormula(eventData);
  }
}

function fetchData({ mathml, collapseSingleOperandNodes, nodesToBeCollapsed, formulaIdentifier = 'A' }) {
  const formData = new FormData();
  formData.append('mathml', mathml);
  formData.append('collapseSingleOperandNodes', collapseSingleOperandNodes);
  formData.append('nodesToBeCollapsed', nodesToBeCollapsed);
  return fetch(`http://math.citeplag.org/api/v1/math/renderAST?cytoscaped=true&formulaidentifier=${formulaIdentifier}`, {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
    }),
    referrerPolicy: 'no-referrer',
    body: formData
  }).then((response) => {
    return response.json().then((data) => {
      if (!response.ok) {
        return Promise.reject(data.Error.output.payload);
      }
      return data;
    });
  });
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
      }
    ],
    layout: {
      name: 'dagre'
    }
  });
}

function highlightNodeAndFormula({ nodeID, presentationID, nodeCollapsed }) {
  const node = formulaAST.$(`node[id='${nodeID}']`);

  // highlight all successor nodes if collapsed node was hovered in similarities-widget
  nodeCollapsed ? highlightNodeAndSuccessors(node) : highlightNode(node);
  toggleFormulaHighlight(presentationID, true);
}

function unhighlightNodeAndFormula({ nodeID, presentationID, nodeCollapsed }) {
  const node = formulaAST.$(`node[id='${nodeID}']`);

  // unhighlight all successor nodes if collapsed node was hovered in similarities-widget
  nodeCollapsed ? unhighlightNodeAndSuccessors(node) : unhighlightNode(node);
  toggleFormulaHighlight(presentationID, false);
}

function sendMessageToParentWindow(node, type) {
  // pass node and all predecessor nodes to similarities-widget to also highlight collapsed nodes
  // to overcome circular references, the removedEles option is deleted on the clone object
  const nodes = node.predecessors().nodes().jsons();
  const clonedNode = node.json();
  delete clonedNode.data.removedEles;
  nodes.unshift(clonedNode);
  const eventData = {
    nodes,
    type,
  };
  window.parent.postMessage(eventData, '*');
}

function attachFormulaEventListeners(cytoscapedAST) {
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
      if (cyNode.length > 0) {
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
      if (cyNode.length > 0) {
        unhighlightNodeAndSuccessors(cyNode);
        svgGroup.classList.remove('highlight');
        sendMessageToParentWindow(cyNode, 'mouseOutNode');
        break;
      }
    }
  });
}

function createEventStreamFromElementArray(elements, type) {
  const observableArray = elements.map(ele => Rx.Observable.fromEvent(ele, type));
  const eventStream = Rx.Observable.merge(...observableArray);
  return eventStream
    .map(e => e.currentTarget)
    .filter(group => group.getBBox().width * group.getBBox().height > 0)
    .buffer(eventStream.debounce(1));
}

function registerEventListeners(cytoscapedAST) {
  attachFormulaEventListeners(cytoscapedAST);
  formulaAST.on('mouseover', 'node', (event) => {
    const node = event.cyTarget;
    sendMessageToParentWindow(event.cyTarget, 'mouseOverNode');
    highlightNodeAndFormula({
      nodeID: node.id(),
      presentationID: node.data().presentationID,
      nodeCollapsed: false,
    });
  });

  formulaAST.on('mouseout', 'node', (event) => {
    const node = event.cyTarget;
    sendMessageToParentWindow(event.cyTarget, 'mouseOutNode');
    unhighlightNodeAndFormula({
      nodeID: node.id(),
      presentationID: node.data().presentationID,
      nodeCollapsed: false
    });
  });

  formulaAST.on('click', 'node[^isLeaf]', (event) => {
    const node = event.cyTarget;
    sendMessageToParentWindow(event.cyTarget, 'mouseOutNode');

    toggleFormulaHighlight(node.data().presentationID, false);
    if (node.data('removedEles')) {
      const nodeWidth = extractDimensionsFromSVG(node.data('nodeSVG'), Dimension.WIDTH);
      const nodeHeight = extractDimensionsFromSVG(node.data('nodeSVG'), Dimension.HEIGHT);
      node.style('background-image', node.data('nodeSVG'));
      node.style('width', nodeWidth);
      node.style('height', nodeHeight);
      node.data('oldWidth', nodeWidth);
      node.data('oldHeight', nodeHeight);
      node.data('removedEles').restore();
      formulaAST.layout({
        name: 'dagre',
        animate: true,
        animationDuration: 700,
      });
      node.removeData('removedEles');
    } else {
      const nodeWidth = extractDimensionsFromSVG(node.data('subtreeSVG'), Dimension.WIDTH);
      const nodeHeight = extractDimensionsFromSVG(node.data('subtreeSVG'), Dimension.HEIGHT);
      node.style('background-image', node.data('subtreeSVG'));
      node.style('width', nodeWidth);
      node.style('height', nodeHeight);
      node.data('oldWidth', nodeWidth);
      node.data('oldHeight', nodeHeight);
      const removedEles = formulaAST.remove(node.successors());
      node.data('removedEles', removedEles);
      formulaAST.layout({
        name: 'dagre',
        animate: true,
        animationDuration: 700,
      });
    }
  });
}

function extractDimensionsFromSVG(dataURI, type) {
  const dimensionInEX = dataURI.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
  const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
  return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
}

function toggleFormulaHighlight(id, addClass) {
  const escapedId = id.replace(/\./g, '\\.');
  const mathJaxNode = document.querySelector(`#${escapedId}`);
  if (mathJaxNode) {
    if (addClass) mathJaxNode.classList.add('highlight');
    else mathJaxNode.classList.remove('highlight');
  }
}
