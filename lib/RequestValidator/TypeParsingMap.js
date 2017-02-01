'use strict';

const xmldom = require('xmldom');
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
    return new DOMParser({
      errorHandler(level, message) {
        throw Error(message);
      }
    }).parseFromString(value, 'application/xml');
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
  number: ''
};
