'use strict';

const express = require('express');
const router = module.exports = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/astRenderer', (req, res) => {
  res.render('ast-renderer');
});

router.get('/mergedASTs', (req, res) => {
  res.render('merged-asts');
});
