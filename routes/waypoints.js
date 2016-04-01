var express = require('express');
var router = express.Router();

router
  .route('/')
  .get(function(req, res) {
    res.json({});
  })
  .post(function(req, res, next) {
    res.json({});
  });

router
  .route('/:id')
  .get(function(req, res, next) {
    res.json({});
  })
  .delete(function(req, res, next) {
    res.json({});
  });
module.exports = router;
