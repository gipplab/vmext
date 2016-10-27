'use strict';
const xml2js = require('xml2js');

module.exports = class XMLParser {
  static parseXML(xml, callback) {
    const parser = new xml2js.Parser();
    parser.parseString(xml, (err, result) => {
      if (err) callback(new ConflictError('XML- Parsing Error'), null);
      return callback(null, result);
    });
  }
};
