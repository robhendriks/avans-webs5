var express = require('express');
var router = express.Router();

var Race = require('../models/race');

router
  .route('/')
  .get(function(req, res, next) {
    Race
      .find()
      .exec(function(err, races) {
        if (err) {
          return next(err);
        }
        res.json(races);
      });
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

router
  .route('/:id/waypoints')
  .get(function(req, res, next) {
    res.json({});
  })
  .post(function(req, res, next) {
    res.json({});
  });

module.exports = router;
