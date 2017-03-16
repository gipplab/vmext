'use strict';

const xmldom = require('xmldom');
const libxmljs = require('libxmljs');
const DOMParser = xmldom.DOMParser;

module.exports = {
  boolean(value) {
    if (value !== 'true' && value !== 'false') {
      throw Error('TypeError');
    } else {
      return value === 'true';
    }
  },
  xml(value) {
    libxmljs.parseXml(value);
    return new DOMParser().parseFromString(value, 'application/xml');
  },
  json(value) {
    try {
      if (value === 'null') throw Error('TypeError');
      return JSON.parse(value);
    } catch (e) {
      throw Error('TypeError');
    }
  },
  string(value) {
    return value;
  },
  int(value) {
    const n = Number(value);
    if (!Number.isInteger(n)) throw Error('TypeError');
    return n;
  },
  number: ''
};
