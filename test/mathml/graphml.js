'use strict';

const graph = require('../../lib/MathML/GraphML');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const file = path.resolve('data/09-goat.mml.xml');
const xmlString = fs.readFileSync(file, 'utf8');

describe('graphml rendering', () => {

  it('should initialize with goat input', () => graph(xmlString));
  it('should get correct number of nodes in goat tree', () => {
    const mathml = graph(xmlString);
    const g = mathml.toGraphML();
    assert(g);
    assert(g.toString().startsWith('<graph'));
    assert.equal(g.attr('xmlns'),'http://graphml.graphdrawing.org/xmlns');
  });
});
