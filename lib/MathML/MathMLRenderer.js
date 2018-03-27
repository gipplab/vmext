'use strict';

const mml = require('./MathMLReader');
const opMap = require('./operationMap');

// const config = require('config');

mml.base.prototype.imgUrl = function(format = false) {
  /**
   * @return {string}
   */
  function toMML(mml) {
    return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline">${mml}</math>`;
  }

  let node;
  if (format === false) {
    format = this.expansion;
  }
  if (format === 'first' && this.name() === 'apply') {
    node = this.children().first().refNode();
  } else if (format === 'collapsed' && this.name() === 'apply') {
    node = this.refNode();
  } else if (opMap.hasOwnProperty(this.name())) {
    node = opMap[this.name()];
  } else {
    node = this.refNode();
  }
  const mml = toMML(node.toString());
  return 'http://localhost:10044/get/svg/mml/' + encodeURIComponent(mml);
};

module.exports = mml;

