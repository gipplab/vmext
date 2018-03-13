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
  it('should fail with empty input',() => assert.throws(() => new MathML()));
  it('should initialize with goat input',() => new MathML(xmlString));
  it('should get goat content',() => {
    const mathml = new MathML(xmlString);
    const contentRoot = mathml.contentRoot;
    assert(contentRoot);
    assert.equal(contentRoot.name(),'apply');
    assert.equal(contentRoot.attr('id'),'e40');
  });
  it('should initialize with pmml annotations',() => new MathML(xmlPString));
  it('should get pmml annotations content',() => {
    const mathml = new MathML(xmlPString);
    const contentRoot = mathml.contentRoot;
    assert(contentRoot);
    assert.equal(contentRoot.name(),'apply');
    assert.equal(contentRoot.attr('id'),'w2');
  });
});
