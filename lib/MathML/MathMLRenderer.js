'use strict';

const mml = require('./MathMLReader');
const mathoidRenderer = require('./MathJaxRenderer');

mml.base.prototype.render = function() {
  return mathoidRenderer.renderMML(this.toString());
};

module.exports = mml;

