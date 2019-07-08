'use strict';

document.addEventListener('astRendered', (e) => {
  document.querySelector('.btn-download').style.display = 'block';
});

global.callAPI = function callAPI(evt) {
  evt.preventDefault();


  document.querySelector('.gif-loader').style.display = 'none';
  document.querySelector('.main-cy-container').style.visibility = 'visible';
  const mmlCy = require('cytoscape-mathml');
  const mmlStr = document.querySelector('#referenceMML').value;
  const contRef = document.getElementById('contRef');
  const contComp = document.getElementById('contComp');
  const similariteies = document.getElementById('similarities').value;
  const mml = mmlCy.mml(mmlStr);
  const cy = mml.toCytoscape({
    container: contRef,
    boxSelectionEnabled: false,
    autounselectify: true,
    applyForm: true
  });
  const mmlStr2 = document.querySelector('#comparisonMML').value;
  const mml2 = mmlCy.mml(mmlStr2);
  const cy2 = mml2.toCytoscape({
    container: contComp,
    boxSelectionEnabled: false,
    autounselectify: true,
    applyForm: true
  });
  const contMerge = document.getElementById('contMerge');
  mml.compareTo({
    container: contMerge,
    boxSelectionEnabled: false,
    autounselectify: true,
    applyForm: true
  },
  mml2,
  JSON.parse(similariteies)
  );
};
