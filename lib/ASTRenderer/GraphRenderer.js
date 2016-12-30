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
    const cy = cytoscape();

    const renderNodes = [
      this.addNodes(this.a, { source: 'A' }),
      this.addNodes(this.b, { source: 'B' })
    ];
    this.addSimilarities(this.similarities);

    return Promise.all(renderNodes).then(() => this.elements);
  }

  elements() {
    return this.elements;
  }

  addNodes(tree, options) {
    return new Promise((resolve, reject) => {
      let pendingTasks = 0;
      let allTasksStarted = false;

      const queue = [tree];

      const renderFailed = err => reject(err);

      while (queue.length > 0) {
        const current = queue.shift();
        const currentId = `${options.source}.${current.id}`;

        const classes = [];
        if (options.source) classes.push(`source-${options.source}`);

        pendingTasks += 1;
        MathJaxRenderer.renderMML(current.nodePresentation).then((svg) => {
          this.elements.push({
            group: 'nodes',
            data: {
              id: currentId,
              presentation: 'data:image/svg+xml,' + querystring.escape(svg),
            },
            classes
          });
          pendingTasks -= 1;
          if (allTasksStarted && pendingTasks === 0) resolve();
        }).catch(renderFailed);

        if (current.children) {
          current.children.forEach((child) => {
            const childId = `${options.source}.${child.id}`;
            this.elements.push({
              group: 'edges',
              data: {
                source: currentId,
                target: childId
              },
              classes: 'hierarchy'
            });

            // queue children of current node
            queue.push(child);
          });
        }
      }
      allTasksStarted = true;
      if (pendingTasks === 0) resolve();
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
            type: match.type
          }
        });
      });
    });
  }
};
