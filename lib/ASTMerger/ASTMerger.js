'use strict';

const MathJaxRenderer = require('app/lib/MathJaxRenderer');

module.exports = class ASTMerger {

  constructor(referenceMathml, comparisonMathml) {
    const promises = [
      new Promise((resolve, reject) => {
        new MathJaxRenderer(referenceMathml).parse((err, result) => {
          if (err) reject(err);
          this.referenceDoc = result;
          resolve();
        });
      }),
      new Promise((resolve, reject) => {
        new MathJaxRenderer(comparisonMathml).parse((err, result) => {
          if (err) reject(err);
          this.comparisonDoc = result;
          resolve();
        });
      })
    ];
    this.documents = Promise.all(promises);
  }

  merge(callback) {
    this.documents.then();
  }
};
