const fs = require('fs');
const XT = require('xtraverse');
const xmlDom = require('xmldom');
const file = '../frontend/data/08-plag-1-46.mml.xml';
const xmlString = fs.readFileSync(file, 'utf8');
const xml = XT(xmlString);
const ids = {};
const prefix = "b";
let counter = 0;

function renameIds(n) {
  for (let child = n.children().first(); child.length > 0; child = child.next()) {
    const id = child.attr('id');
    const newId = prefix + counter;
    if (id) {
      ids[id] = newId;
    }
    counter++;
    child[0].setAttribute('id', newId);
    renameIds(child);
  }
}

function replaceReferences(n) {
  for (let child = n.children().first(); child.length > 0; child = child.next()) {
    const xref = child.attr('xref');
    if (xref) {
      if (ids[xref]) {
        child[0].setAttribute('xref', ids[xref]);
      } else {
        child[0].removeAttribute('xref');
      }
    }
    replaceReferences(child);
  }
}


renameIds(xml);
replaceReferences(xml);

const serializer = new xmlDom.XMLSerializer();
const writetofile = serializer.serializeToString(xml[0]);
fs.writeFileSync(file, writetofile);
