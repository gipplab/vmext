/* eslint-disable */
'use strict';

const phantom = require('phantom');
const fs = require('fs');

module.exports = class SnapRenderer {
  renderSingleTree(cytoNodes, width, height) {
    const tmpFilename = '/tmp/phantom/' + Date.now() + '.png';
    let _ph, _page;
    return phantom.create().then((ph) => {
      _ph = ph;
      return ph.createPage();
    })
    .then((page) => {
      _page = page;
      _page.property('clipRect', { top: 0, left: 0, width, height });
      _page.property('viewportSize', { width, height });
      return page.open('./lib/ASTRenderer/renderScripts/singleTree.html');
    })
    .then((status) => {
      if (status !== 'success') return Promise.reject('PhantomJS page load failed.');

      return _page.evaluate(function(elements, width, height) {
        setDimensions(width, height);
        window.beginCyto(elements);
      }, cytoNodes, width, height);
    })
    .then(() => _page.render(tmpFilename, { format: 'png', quality: 100 }))
    .then(() => {
      _page.close();
      _ph.exit();
      return tmpFilename;
    })
    .catch(e => _ph.exit());
  }

  renderMergedTree(cytoNodes, width, height) {
    fs.writeFileSync('./cyto.js', JSON.stringify(cytoNodes));
    const tmpFilename = '/tmp/phantom/' + Date.now() + '.png';
    let _ph, _page;
    return phantom.create().then((ph) => {
      _ph = ph;
      return ph.createPage();
    })
    .then((page) => {
      _page = page;
      _page.property('clipRect', { top: 0, left: 0, width, height });
      _page.property('viewportSize', { width, height });
      return page.open('./lib/ASTRenderer/renderScripts/mergedAst.html');
    })
    .then((status) => {
      if (status !== 'success') return Promise.reject('PhantomJS page load failed.');

      return _page.evaluate(function(elements, width, height) {
        setDimensions(width, height);
        window.beginCyto(elements);
      }, cytoNodes, width, height);
    })
    .then(() => _page.render(tmpFilename, { format: 'png' }))
    .then(() => {
      _page.close();
      _ph.exit();
      return tmpFilename;
    })
    .catch(e => _ph.exit());
  }
};
