'use strict';

const cytoscape = require('cytoscape');
const MathJaxRenderer = require('lib/MathJaxRenderer');
const querystring = require('querystring');
const log = require('lib/logger');


module.exports = class GraphRenderer {
  /**
   * Creates an instance of GraphRenderer.
   * @param {Object} formulaA First formula tree (as returned by ASTParser)
   * @param {Object} [formulaB={}] second formula tree
   * @param {Array} [similarities=[]] array of similarity objects (@see addSimilarities)
   */
  constructor(formulaA, formulaB = {}, similarities = []) {
    this.elements = [];
    this.a = formulaA;
    this.b = formulaB;
    this.similarities = similarities;
  }

  /**
   * Just render the syntax tree of the first formula that this instance was initialized with.
   * No further processing is done.
   * @return {Array} cytoscape element json
   */
  renderSingleTree(source) {
    this.addNodes(this.a, { source });
    const cy = cytoscape({
      elements: this.elements
    });
    cy.nodes().leaves().forEach((node) => {
      node.data('isLeaf', true);
    });
    return this.renderMathML(cy).then((cyto) => {
      return cyto.elements().jsons();
    });
  }

  /**
   * Renders the merged syntax tree graph
   * @return {Array} cytoscape element json
   */
  render() {
    const renderNodes = [
      this.addNodes(this.a, { source: 'A' }),
      this.addNodes(this.b, { source: 'B' })
    ];
    this.addSimilarities(this.similarities);

    return Promise.all(renderNodes).then(() => {
      const cy = cytoscape({
        elements: this.elements
      });

      this.collapseIdenticalMatches(cy);
      this.collapseSimilarMatches(cy);
      this.collapseUnmatchedSubtrees(cy);
      return this.renderMathML(cy);
    }).then((cyto) => {
      return cyto.elements().jsons();
    });
  }

  elements() {
    return this.elements;
  }

  /**
   * Renders MathML on each node asynchronously using MathJAX
   */
  renderMathML(cy) {
    return new Promise((resolve, reject) => {
      Promise.all(cy.nodes().map((el) => {
        const mathml = (el.hasClass('collapse')) ? el.data('subtreePresentation') : el.data('nodePresentation');
        if  (!mathml) {
          if (el.hasClass('matchContainer')) {
            return resolve(cy);
          }
          log.warn("try to render empty SVG from ", el.data());
          const emptySvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1ex" height="1ex"/>';
          el.data('nodeSVG', `data:image/svg+xml;utf8,${querystring.escape(emptySvg)}`);
          el.data('subtreeSVG',`data:image/svg+xml;utf8,${querystring.escape(emptySvg)}`);
          return resolve(cy);
        }
        return MathJaxRenderer.renderMML(mathml)
          .then((nodeSVG) => {
            el.data('nodeSVG', `data:image/svg+xml;utf8,${querystring.escape(nodeSVG.svg)}`);
            el.removeData('nodePresentation');
            if (el.data('subtreePresentation') !== undefined) {
              return MathJaxRenderer.renderMML(el.data('subtreePresentation'))
                .then((subtreeSVG) => {
                  el.data('subtreeSVG', `data:image/svg+xml;utf8,${querystring.escape(subtreeSVG.svg)}`);
                  el.removeData('subtreePresentation');
                });
            }
          });
      })).then(() => {
        resolve(cy);
      }).catch((err) => {
        log.error(err);
        reject(cy);
      });
    });
  }

  /**
   * Combine similar nodes into compound nodes and collapse their subtrees
   * @private
   * @param {cytoscape} cy cytoscape instance
   */
  collapseSimilarMatches(cy) {
    cy.edges('[matchType="similar"]').forEach((edge, i) => {
      const nodeA = edge.connectedNodes('[source="A"]');
      const nodeB = edge.connectedNodes('[source="B"]');

      if (nodeA.outgoers('[type="hierarchy"]').length > 0) { nodeA.addClass('collapse'); }
      if (nodeB.outgoers('[type="hierarchy"]').length > 0) { nodeB.addClass('collapse'); }

      edge.connectedNodes().successors('[type="hierarchy"]').targets().remove();

      const compoundNode = cy.add({
        group: 'nodes',
        data: {
          id: `match-similar-${i}`,
          label: 'Similar',
        },
        classes: 'matchContainer'
      });

      nodeA
        .move({ parent: compoundNode.id() })
        .addClass('match match-similar');

      nodeB
        .move({ parent: compoundNode.id() })
        .addClass('match match-similar');
    });
  }

  /**
   * Collapses subtrees of identically matched nodes and merges them into one
   * @private
   * @param {cytoscape} cy cytoscape instance
   */
  collapseIdenticalMatches(cy) {
    cy.edges('[matchType="identical"]').forEach((edge) => {
      // remove subtrees for matched nodes
      const nodeA = edge.connectedNodes('[source="A"]');
      const nodeB = edge.connectedNodes('[source="B"]');

      const isLeafNode = nodeA.outgoers('[type="hierarchy"]').length > 0;

      edge.connectedNodes().successors('[type="hierarchy"]').targets().remove();

      const edgeA = nodeA.incomers('[type="hierarchy"]');
      const edgeB = nodeB.incomers('[type="hierarchy"]');

      // replace matched nodes with a common node shared between both trees and redo the connections
      [nodeA, nodeB, edgeA, edgeB].forEach(n => n.remove());
      const newNode = cy.add(nodeA.json());
      // add id from second formula for frontend highlighting
      newNode.data('source-B-id', nodeB.id());

      newNode.addClass('match match-identical');
      if (isLeafNode) { newNode.addClass('collapse'); }

      // replace incoming edge(formulaA) unless match is root of tree
      if (edgeA.length > 0) {
        cy.add(Object.assign({}, edgeA.json(), {
          data: {
            source: edgeA.source().id(),
            target: newNode.id(),
            type: 'hierarchy'
          }
        }));
      }

      // replace incoming edge(formulaB) unless match is root of tree
      if (edgeB.length > 0) {
        cy.add(Object.assign({}, edgeB.json(), {
          data: {
            source: edgeB.source().id(),
            target: newNode.id(),
            type: 'hierarchy'
          }
        }));
      }
    });
  }

  /**
   * Collapses subtrees of the graph that contain no matches
   * @private
   * @param {cytoscape} cy cytoscape instance
   */
  collapseUnmatchedSubtrees(cy) {
    // find leaf nodes with no matches
    const leaves = cy.nodes().leaves();

    const collapseNodeIds = new Set();
    const tmpCollapseNodeIds = new Set();

    for (let i = 0; i < leaves.length; i++) {
      let current = leaves[i];
      let previous = null;
      let noMatchesFound = true;
      while (noMatchesFound && current) {
        // abort this if the current node was already identified as collapsible in a previous iteration
        // optimization to avoid redundant workload
        if (tmpCollapseNodeIds.has(current.id())) {
          break;
        }
        // try to get equivalent node to current node from other tree
        const currentMatch = current.hasClass('match');

        // get successors of this node
        const successors = cy.collection(current).successors('node.match');

        noMatchesFound = successors.length === 0 && !currentMatch;

        if (noMatchesFound) {
          // only keep top level node to collapse, discard nested nodes that are collapsed within it
          if (previous) { collapseNodeIds.delete(previous[0].id()); }

          collapseNodeIds.add(current.id());
          tmpCollapseNodeIds.add(current.id());
        }

        previous = current;
        current = current.incomers('[type="hierarchy"]').source();
      }
    }

    collapseNodeIds.forEach((id) => {
      const n = cy.getElementById(id);
      if (n.length > 0 && n.outgoers('[type="hierarchy"]').length > 0) {
        n.addClass('collapse');
        n.successors().remove();
      }
    });
  }

  /**
   * Recursively iterates over the tree representation of a formula and adds
   * its content as cytoscape nodes
   */
  addNodes(tree, options) {
    return new Promise((resolve) => {
      const queue = [tree];

      while (queue.length > 0) {
        const current = queue.shift();
        const currentId = `${options.source}.${current.id}`;

        const classes = [];
        if (options.source) { classes.push(`source-${options.source}`); }
        if (current.name === 'ambiguous') { classes.push('ambiguous'); }

        this.elements.push({
          group: 'nodes',
          data: {
            id: currentId,
            presentationID: current.presentation_id,
            source: options.source,
            nodePresentation: current.nodePresentation,
            subtreePresentation: current.presentation,
            cs: current.cs,
            cd: current.cd,
            symbol: current.symbol,
            pos: current.pos,
            properties: current.properties
          },
          classes: classes.join(' ')
        });

        if (current.children) {
          current.children.forEach((child) => {
            const childId = `${options.source}.${child.id}`;
            this.elements.push({
              group: 'edges',
              data: {
                source: currentId,
                target: childId,
                type: 'hierarchy'
              },
              classes: 'hierarchy'
            });

            // queue children of current node
            queue.push(child);
          });
        }
      }
      resolve();
    });
  }

  /**
   * Adds similarities as graph edges
   * Similarities are represented as an array of objects like this one:
   *
   * {
   *   id: <mathML node id>,
   *   matches: [
   *     {
   *       id: <mathml node id>,
   *       assessment: <assessment score>,
   *       type: <identical|similar>,
   *     }
   *   ]
   * }
   * @param {Array} similarities Array of similarity objects
   */
  addSimilarities(similarities) {
    similarities.forEach((sim) => {
      sim.matches.forEach((match) => {
        this.elements.push({
          group: 'edges',
          data: {
            source: 'A.' + sim.id,
            target: 'B.' + match.id,
            assessment: match.assessment,
            type: 'match',
            matchType: match.type
          }
        });
      });
    });
  }
};
