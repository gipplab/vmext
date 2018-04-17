'use strict';

// TODO: find a proper way to handle the config
// const Configstore = require('configstore');
// new Configstore('vmedit', { mathoidUrl: 'https://mathoid.formulasearchengine.com' });
// const conf = new Configstore('vmedit', { mathoidUrl: 'https://mathoid.formulasearchengine.com' });
const values = { mathoidUrl: 'https://mathoid.formulasearchengine.com' };
const conf = {
  get(name) {
    return values[name];
  }
};
module.exports = conf;
