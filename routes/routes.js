'use strict';

const express = require('express');
const preq = require('preq');
const router = module.exports = express.Router({ mergeParams: true });
const _ = require('lodash');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/astRenderer', (req, res) => {
  res.render('ast-renderer');
});

router.get('/mergedASTs', (req, res) => {
  res.render('merged-asts');
});

router.get('/popupInfo/:cd/:symbol', (req, res) => {
  const cd = req.params.cd;
  const symbol = req.params.symbol;
  if (symbol.charAt(0) === 'Q') {
    preq.get(
      {
        uri: `http://www.wikidata.org/wiki/Special:EntityData/${symbol}.json`,
      }
    ).then((content) => {
      res.json({
        title:`<a href="https://wikidata.org/wiki/${symbol}" target="_blank">Wikidata ${symbol}</a>`,
        text: '<p>' + _.get(content, `body.entities[${symbol}].labels.en.value`, symbol)  + '</p>' +
        '<p>' +  _.get(content, `body.entities[${symbol}].descriptions.en.value`, 'no description') + '</p>'
      });
    }).catch((e) => {
      res.status(400).send('Error while requesting popup Information: ' + e.message);
    });
  } else {
    res.json({
      title:`${cd} - ${symbol}`,
      text: `No information found for ${cd} - ${symbol}`
    });
  }
});
