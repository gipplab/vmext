'use strict';

const cytoscapeRenderer = require('../../lib/MathML/cytoscape');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const file = path.resolve('data/09-goat.mml.xml');
const xmlString = fs.readFileSync(file, 'utf8');

describe('cytoscape rendering', () => {

  it('should initialize with goat input', () => cytoscapeRenderer(xmlString));
  it('should get correct number of nodes in goat tree', () => {
    const mathml = cytoscapeRenderer(xmlString);
    const cy = mathml.toCytoscape({
      headless: true,
      styleEnabled: true
    });
    assert(cy);
    assert.equal(cy.elements().length,39);
    assert.equal(cy.edges().length,19);
    assert.equal(cy.nodes().length,20);
    // required if headless styles are enabled
    cy.destroy();
  });
});
