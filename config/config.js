'use strict';
const yaml = require('js-yaml');
const fs = require('fs');
module.exports = yaml.safeLoad(fs.readFileSync(__dirname + '/../config.yaml'));
if(process.env.TRAVIS){
  module.exports.mathoidUrl = 'http://localhost:10044';
}

