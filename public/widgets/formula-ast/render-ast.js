'use strict';

let formulaAST;
const initialViewport = {};
let initialAST;
let currentMouseOverCytoNode;
let codeMirror;
let overlay;

/**
 * from https://gist.github.com/catarak/1c9453ad7e1ca0fb303652e4c02fbac1
 * from http://codemirror.net/addon/search/search.js
 * @param query
 * @param caseInsensitive
 * @returns {{name: string, token: token}}
 */
function searchOverlay(query, caseInsensitive) {
  if (typeof query === "string") {
    query = new RegExp(query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), caseInsensitive ? "gi" : "g");
  } else if (!query.global) {
    query = new RegExp(query.source, query.ignoreCase ? "gi" : "g");
  }

  return {
    name: "myOv",
    token(stream) {
      query.lastIndex = stream.pos;
      const match = query.exec(stream.string);
      if (match && match.index === stream.pos) {
        stream.pos += match[0].length || 1;
        return "searching";
      } else if (match) {
        stream.pos = match.index;
      } else {
        stream.skipToEnd();
      }
    }
  };
}

window.addEventListener('message', paramsReveived, false);

/**
 * EventListener for postMessage-iframe-events (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
 * Events can be of two types:
 *  1. intitialData - contains attributes attached to original widget <script>-Tag for initialistion
 *  2. hover information: either mouseover or mouseout from another widget for highlighting purposes
 */
function paramsReveived(event) {
  const eventData = event.data;
  codeMirror = event.source.cm;
  if (eventData.isInitialData) {


    fetchData(eventData)
      .then((result) => {
        initialAST = JSON.parse(JSON.stringify(result.cytoscapedAST));
        document.body.dispatchEvent(new Event('rendered'));
        document.querySelector('.formula-container').style.display = 'block';
        document.querySelector('.formula-container').innerHTML = decodeURIComponent(result.formulaSVG);
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
        console.error(err);
      });
  } else if (formulaAST) {
    const node = formulaAST.$(`node[id='${eventData.nodeID}']`);
    eventData.type === 'mouseOverNode' ?
      highlightNodeAndFormula(eventData) :
      unhighlightNodeAndFormula(eventData);
  }
}

window.addEventListener('resize', debounce(() => {
  if (formulaAST) {
    formulaAST.layout({
      name: 'dagre',
      fit: true,
    });
  }
}, 40));

function fetchData({ mathml, collapseSingleOperandNodes, nodesToBeCollapsed, formulaIdentifier = 'A', widgetHost }) {
  const formData = new FormData();
  formData.append('mathml', mathml);
  formData.append('collapseSingleOperandNodes', collapseSingleOperandNodes);
  formData.append('nodesToBeCollapsed', nodesToBeCollapsed);
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
      },
    ],
    layout: {
      name: 'dagre'
    }
  });
  initialViewport.zoom = formulaAST.zoom();
  Object.assign(initialViewport, formulaAST.pan());
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
      if (cyNode.length > 0 && !cyNode.data('isHidden')) {
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
      if (cyNode.length > 0 && !cyNode.data('isHidden')) {
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
  formulaAST.on('mouseover', 'node[^isHidden]', (event) => {
    const node = event.cyTarget;
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
          event: 'click mouseenter'
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
    sendMessageToParentWindow(event.cyTarget, 'mouseOverNode');
    highlightNodeAndFormula({
      nodeID: node.id(),
      presentationID: node.data().presentationID,
      nodeCollapsed: false,
    });

  });

  formulaAST.on('mouseout', 'node[^isHidden]', (event) => {
    const node = event.cyTarget;
    currentMouseOverCytoNode = node;
    const data = node.data();
    if (data.cd || data.cs) {
      const qtip = node.qtip('api');
      qtip.hide();
    }
    sendMessageToParentWindow(event.cyTarget, 'mouseOutNode');
    unhighlightNodeAndFormula({
      nodeID: node.id(),
      presentationID: node.data().presentationID,
      nodeCollapsed: false
    });
  });

  formulaAST.on('click', 'node[^isLeaf][^isHidden]', (event) => {
    const node = event.cyTarget;
    sendMessageToParentWindow(event.cyTarget, 'mouseOutNode');

    toggleFormulaHighlight(node.data().presentationID, false);
    if (node.data('isCollapsed')) {
      const nodeWidth = extractDimensionsFromSVG(node.data('nodeSVG'), Dimension.WIDTH);
      const nodeHeight = extractDimensionsFromSVG(node.data('nodeSVG'), Dimension.HEIGHT);
      node.style('background-image', node.data('nodeSVG'));
      node.style('width', nodeWidth);
      node.style('height', nodeHeight);
      node.style('background-color', node.data('oldColor'));
      node.data('oldWidth', nodeWidth);
      node.data('oldHeight', nodeHeight);
      node.data('isCollapsed', false);
      node.data('hiddenEles').removeData('isHidden');
      node.data('hiddenEles').animate({
        style: {
          opacity: 1,
          'background-image-opacity': 1,
        },
        duration: defaults.animation.nodeCollapsing,
      });

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
      const nodeWidth = extractDimensionsFromSVG(node.data('subtreeSVG'), Dimension.WIDTH);
      const nodeHeight = extractDimensionsFromSVG(node.data('subtreeSVG'), Dimension.HEIGHT);
      node.style('background-image', node.data('subtreeSVG'));
      node.style('width', nodeWidth);
      node.style('height', nodeHeight);
      node.style('background-color', node.data('oldColor'));
      node.data('oldWidth', nodeWidth);
      node.data('oldHeight', nodeHeight);
      node.data('isCollapsed', true);
      const nodesToHide = node.successors('*[!isHidden]');
      node.data('hiddenEles', nodesToHide);
      nodesToHide.data('isHidden', true);
      nodesToHide.animate({
        style: {
          'background-image-opacity': 0,
          opacity: 0,
        }
      }, { duration: defaults.animation.nodeCollapsing }
      );
      const viewport = {
        pan: formulaAST.pan(),
        zoom: formulaAST.zoom(),
      };
      formulaAST.layout({
        name: 'dagre',
        animate: true,
        animationDuration: defaults.animation.nodeCollapsing,
        fit: formulaAST.zoom() === initialViewport.zoom, // only fit in original viewport
      });
    }
  });
}

function extractDimensionsFromSVG(dataURI, type) {
  try {
    const dimensionInEX = dataURI.match(`${type}%3D%22([0-9]*.[0-9]*)ex`)[1];
    const dimensioninPX = dimensionInEX * defaults.exScalingFactor;
    return dimensioninPX > defaults.minNodeSize ? dimensioninPX : defaults.minNodeSize;
  } catch (e) {
    console.log(e);
    return defaults.minNodeSize;
  }
}

function toggleFormulaHighlight(id, addClass) {
  const escapedId = id.replace(/\./g, '\\.');
  const mathJaxNode = document.querySelector(`#${escapedId}`);
  if (mathJaxNode) {
    if (addClass) {
      mathJaxNode.classList.add('highlight');
      if (codeMirror) {
        codeMirror.addOverlay(searchOverlay(`"${id}"`), false);
      }
    } else {
      mathJaxNode.classList.remove('highlight');
      codeMirror.removeOverlay("myOv");
    }
  }
}

function resetViewport() {
  formulaAST.layout({
    name: 'dagre',
    fit: true,
  });
}

function expandAllNodes() {
  formulaAST.remove(formulaAST.elements());
  formulaAST.add(JSON.parse(JSON.stringify(initialAST))); // deep clone to be immutable to cytoscape
  formulaAST.layout({
    name: 'dagre',
    fit: false,
  });
}
