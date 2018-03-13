'use strict';

const MathML = require('../../lib/MathML/MathMLReader');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('MathML reading', () => {
  const file = path.resolve('data/09-goat.mml.xml');
  const xmlString = fs.readFileSync(file, 'utf8');
  const pFile = path.resolve('data/10-pmml-annotation.mml.xml');
  const xmlPString = fs.readFileSync(pFile, 'utf8');
  it('should initialize with goat input',() => MathML(xmlString));
  it('should get goat content',() => {
    const mathml = MathML(xmlString);
    const contentRoot = mathml.contentRoot();
    assert(contentRoot);
    assert.equal(contentRoot.name(),'apply');
    assert.equal(contentRoot.id(),'e40');
  });
  it('should initialize with pmml annotations',() => MathML(xmlPString));
  it('should get pmml annotations content',() => {
    const mathml = MathML(xmlPString);
    const contentRoot = mathml.contentRoot();
    assert(contentRoot);
    assert.equal(contentRoot.name(),'apply');
    assert.equal(contentRoot.id(),'w2');
    assert.equal(contentRoot.xref(),'w29');
    assert(contentRoot.contentRoot());
  });
  it('should fail for empty input',() => assert.throws(() => MathML().contentRoot()));
});
