'use strict';

const Configstore = require('configstore');
const conf = new Configstore('vmedit', { mathoidUrl: 'https://mathoid.formulasearchengine.com' });

module.exports = conf;
