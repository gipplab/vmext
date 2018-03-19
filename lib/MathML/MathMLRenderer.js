'use strict';

const mml = require('./MathMLReader');

mml.base.prototype.render = function() {
  return this.toString();
};

module.exports = mml;

