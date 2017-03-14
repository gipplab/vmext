'use strict';

const stream = require('stream');
const phantom = require('phantom');
const fs = require('fs');

function getStream(text) {
  const s = new stream.Duplex();
  s.push(text);
  s.push(null);
  return s;
}

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */

"use strict";
function waitFor(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
    start = new Date().getTime(),
    condition = false,
    interval = setInterval(function() {
      if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
        // If not time-out yet and condition not yet fulfilled
        testFx().then((res) => {
          condition = res;
        });
      } else {
        if (!condition) {
          // If condition still not fulfilled (timeout but condition is 'false')
          console.log("'waitFor()' timeout");
          clearInterval(interval);
        } else {
          // Condition fulfilled (timeout and/or condition is 'true')
          console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
          typeof(onReady) === "string" ? eval(onReady) : onReady();
          clearInterval(interval);
        }
      }
    }, 250); //< repeat check every 250ms
};

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
    .then(() => _page.render(tmpFilename, { format: 'png' }))
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
