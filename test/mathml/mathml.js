'use strict';

const MathML = require('../../lib/MathML/MathMLReader');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const file = path.resolve('data/09-goat.mml.xml');
const xmlString = fs.readFileSync(file, 'utf8');
const pFile = path.resolve('data/10-pmml-annotation.mml.xml');
const xmlPString = fs.readFileSync(pFile, 'utf8');

describe('MathML reading', () => {

  it('should initialize with goat input', () => MathML(xmlString));
  it('should get goat content', () => {
    const mathml = MathML(xmlString);
    const contentRoot = mathml.contentRoot();
    assert(contentRoot);
    assert.equal(contentRoot.name(), 'apply');
    assert.equal(contentRoot.id, 'e40');
  });
  it('xref should point to coresponding elements', () => {
    const mathml = MathML(xmlString);
    const contentRoot = mathml.contentRoot();
    const presentationRoot = contentRoot.refNode();
    assert.equal(contentRoot.id, presentationRoot.xref());
    assert.equal(presentationRoot.id, contentRoot.xref());
  });

  it('should initialize with pmml annotations', () => MathML(xmlPString));
  it('should get pmml annotations content', () => {
    const mathml = MathML(xmlPString);
    const contentRoot = mathml.contentRoot();
    assert(contentRoot);
    assert.equal(contentRoot.name(), 'apply');
    assert.equal(contentRoot.id, 'w2');
    assert.equal(contentRoot.xref(), 'w29');
    assert(contentRoot.contentRoot());
  });

  it('should fail for empty input', () => assert.throws(() => MathML().contentRoot()));
  it('should fail for math elements without presentation', () => assert.throws(() => MathML('<math/>').contentRoot()));
  it('refNode should be empty if xref not specified', () => assert.equal(MathML('<math/>').refNode().length,0));


});

describe('MathML positions', () => {
  it('xref should get first node position', () => {
    const mathml = MathML(xmlString);
    const first = mathml.first().estimateLocation();
    assert.equal(first.start.line, 1);
    assert.equal(first.start.ch, 1);
    assert.equal(first.end.line, 81);
    assert.equal(first.end.ch, 15);
  });
  it('xref should get content node position', () => {
    const mathml = MathML(xmlString);
    const first = mathml.contentRoot().estimateLocation();
    assert.equal(first.start.line, 52);
    assert.equal(first.start.ch, 7);
    assert.equal(first.end.line, 78);
    assert.equal(first.end.ch, 15);
  });
  it('xref should not fail for empty math tag', () => {
    const mathml = MathML('<math/>');
    const first = mathml.first().estimateLocation();
    assert.equal(first.start.line, 1);
    assert.equal(first.start.ch, 1);
    assert.equal(first.end.line, 1);
    assert.equal(first.end.ch, 1);
  });
});
