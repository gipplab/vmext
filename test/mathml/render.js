'use strict';

const renderer = require('../../app/MathML/MathMLRenderer');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const file = path.resolve('data/09-goat.mml.xml');
const xmlString = fs.readFileSync(file, 'utf8');

describe('mathml rendering', () => {

  it('should initialize with goat input', () => renderer(xmlString));
  // it('should get correct number of nodes in goat tree', (done) => {
  //   const mathml = renderer(xmlString);
  //   mathml.render().then((res )=>{
  //     assert(res);
  //     assert.equal(res.log,'success');
  //     assert(res.success);
  //     assert(res.svg.startsWith('<svg'));
  //     done();
  //   });
  // });
});
