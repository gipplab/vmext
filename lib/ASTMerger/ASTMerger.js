'use strict';

const ASTParser = require('app/lib/ASTParser');
const log = require('app/lib/logger');

module.exports = class ASTMerger {

  constructor(referenceMathml, comparisonMathml, similarities) {
    const promises = [
      new ASTParser(referenceMathml).parse().then((result) => {
        this.referenceDoc = result;
      }),
      new ASTParser(comparisonMathml).parse().then((result) => {
        this.comparisonDoc = result;
      })
    ];
    this.documents = Promise.all(promises);
    this.similarities = similarities;
  }

  merge() {
    return this.documents.then(() => {
      const queue = [this.referenceDoc];

      while (queue.length > 0) {
        const currentNode = queue.shift();
        // queue children of current node
        if (currentNode.children) {
          for (let i = 0; i < currentNode.children.length; i++) {
            queue.push(currentNode.children[i]);
          }
        }

        for (let i = 0; i < this.similarities.length; i++) {
          const currentSimilarity = this.similarities[i];
          if (currentSimilarity.id === currentNode.id) {
            currentNode.similarNodes = currentSimilarity.matches.map((match) => {
              const referencedNode = ASTMerger.findNodeById(match.id, this.comparisonDoc);
              return Object.assign({}, referencedNode, match);
            });
          }
        }
      }

      return this.referenceDoc;
    })
    .catch(log.error);
  }

  static findNodeById(id, tree) {
    const queue = [tree];

    while (queue.length > 0) {
      const currentNode = queue.shift();
      if (currentNode.id === id) return currentNode;

      // queue children of current node
      if (currentNode.children) {
        for (let i = 0; i < currentNode.children.length; i++) {
          queue.push(currentNode.children[i]);
        }
      }
    }

    return false;
  }
};
