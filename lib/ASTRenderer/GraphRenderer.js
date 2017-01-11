'use strict';

const cytoscape = require('cytoscape');
const MathJaxRenderer = require('app/lib/MathJaxRenderer');
const querystring = require('querystring');

module.exports = class GraphRenderer {
  constructor(formulaA, formulaB, similarities) {
    this.elements = [];
    this.a = formulaA;
    this.b = formulaB;
    this.similarities = similarities;
  }

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

      cy.edges('[matchType="identical"]').forEach((edge) => {
        edge.connectedNodes().successors('[type="hierarchy"]').targets().remove();
        const nodeA = edge.connectedNodes('[source="A"]');
        const nodeB = edge.connectedNodes('[source="B"]');

        const edgeA = nodeA.incomers('[type="hierarchy"]');
        const edgeB = nodeB.incomers('[type="hierarchy"]');

        [nodeA, nodeB, edgeA, edgeB].forEach(n => n.remove());
        const newNode = cy.add(nodeA.json());
        newNode.addClass('match match-identical collapse');

        cy.add(Object.assign({}, edgeA.json(), {
          data: {
            source: edgeA.source().id(),
            target: newNode.id(),
            type: 'hierarchy'
          }
        }));

        cy.add(Object.assign({}, edgeB.json(), {
          data: {
            source: edgeB.source().id(),
            target: newNode.id(),
            type: 'hierarchy'
          }
        }));
      });

      this.collapseUnmatchedSubtrees(cy);
      return this.renderMathML(cy);
    }).then((cy) => {
      return cy.elements().jsons();
    });
  }

  elements() {
    return this.elements;
  }

  renderMathML(cy) {
    return new Promise((resolve, reject) => {
      let allTasksStarted = false;
      let tasksRemaining = 0;

      cy.nodes().forEach((el) => {
        tasksRemaining++;

        const mathml = (el.hasClass('collapse')) ? el.data('subtreePresentation') : el.data('nodePresentation');
        MathJaxRenderer.renderMML(mathml).then((svg) => {
          el.data('presentation', 'data:image/svg+xml;utf8,' + querystring.escape(svg));
          el.removeData('nodePresentation');
          el.removeData('subtreePresentation');
          tasksRemaining--;

          if (tasksRemaining === 0 && allTasksStarted) resolve(cy);
        })
        .catch(err => reject(err));
      });

      allTasksStarted = true;

      if (tasksRemaining === 0) resolve(cy);
    });
  }

  collapseUnmatchedSubtrees(cy) {
    // find leaf nodes with no matches
    const leaves = cy.nodes().leaves();

    const collapseNodeIds = new Set();
    const tmpCollapseNodeIds = new Set();

    for (let i = 0; i < leaves.length; i++) {
      let current = cy.collection([leaves[i]]);
      let previous = null;
      let noMatchesFound = true;
      while (noMatchesFound) {
        // abort this if the current node was already identified as collapsible in a previous iteration
        // optimization to avoid redundant workload
        if (tmpCollapseNodeIds.has(current[0].id())) {
          break;
        }
        // try to get equivalent node to current node from other tree
        const currentMatch = current.hasClass('match');

        // get successors of this node
        const successors = cy.collection(current).successors('node.match');

        noMatchesFound = successors.length === 0 && !currentMatch;

        if (noMatchesFound) {
          // only keep top level node to collapse, discard nested nodes that are collapsed within it
          if (previous) collapseNodeIds.delete(previous[0].id());

          collapseNodeIds.add(current[0].id());
          tmpCollapseNodeIds.add(current[0].id());
        }

        previous = current;
        current = current.incomers('[type="hierarchy"]').connectedNodes();
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

  addNodes(tree, options) {
    return new Promise((resolve, reject) => {
      const queue = [tree];

      while (queue.length > 0) {
        const current = queue.shift();
        const currentId = `${options.source}.${current.id}`;

        const classes = [];
        if (options.source) classes.push(`source-${options.source}`);

        this.elements.push({
          group: 'nodes',
          data: {
            id: currentId,
            source: options.source,
            nodePresentation: current.nodePresentation,
            subtreePresentation: current.presentation
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
