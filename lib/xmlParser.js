'use strict';
const path = require('path'),
      xml2js = require('xml2js'),
      ConflictError = require(path.join(process.cwd(), 'errorHandler', 'ConflictError'));

module.exports = class XMLParser {
  static parseXML(xml, callback) {
    const parser = new xml2js.Parser();
    parser.parseString(xml, (err, result) => {
      if (err) return callback(new ConflictError('XML-Parsing Error'), null);
      callback(null, result);
    });
  }
};
