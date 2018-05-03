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

  let node = this.first();
  if (format === false) {
    format = this.expansion;
  }
  if (format === 'first' && this.name() === 'apply') {
    node = this.children().first();
  }
  const collapsedApply = format === 'collapsed' && this.name() === 'apply';
  if (!collapsedApply && opMap.hasOwnProperty(node.name())) {
    node = opMap[node.name()];
  } else {
    node = node.refNode();
  }
  const mml = toMML(node.toString());
  return 'http://localhost:10044/get/svg/mml/' + encodeURIComponent(mml);
};

module.exports = mml;

