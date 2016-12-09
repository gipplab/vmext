'use strict';

const MathMLParser = require('app/lib/MathMLParser');
const xmldom = require('xmldom');
const DOM = xmldom.DOMParser;

module.exports = class ASTMerger {

  constructor(referenceMathml, comparisonMathml, similarityXml) {
    const promises = [
      new Promise((resolve, reject) => {
        new MathMLParser(referenceMathml).parse((err, result) => {
          if (err) reject(err);
          this.referenceDoc = result;
          resolve();
        });
      }),
      new Promise((resolve, reject) => {
        new MathMLParser(comparisonMathml).parse((err, result) => {
          if (err) reject(err);
          this.comparisonDoc = result;
          resolve();
        });
      })
    ];
    this.documents = Promise.all(promises);
    this.similarityXml = new DOM().parseFromString(similarityXml);
  }

  merge() {
    return this.documents.then(() => {
      return Promise.resolve("hello");
    });
  }
};
