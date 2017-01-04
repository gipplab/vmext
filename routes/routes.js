'use strict';

const express = require('express');
const router = module.exports = express.Router({ mergeParams: true });

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/astRenderer', (req, res, next) => {
  res.render('ast-renderer');
});

router.get('/mergedASTs', (req, res, next) => {
  res.render('merged-asts');
});
