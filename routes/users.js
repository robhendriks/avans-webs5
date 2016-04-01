var util = require('util');
var express = require('express');
var rest = require('../helpers/rest');

var router = express.Router();

var User = require('../models/user');
var Waypoint = require('../models/waypoint');

router
  .route('/')
  .get(function(req, res, next) {
    User
      .find()
      .select('id email name')
      .lean()
      .exec(function(err, users) {
        if (err) {
          return next(err);
        }
        res.json(users);
      });
  });

router
  .route('/:id')
  .get(function(req, res, next) {
    User
      .findById(req.params.id)
      .select('id email name')
      .lean()
      .exec(function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(rest.notFound);
        }
        res.json(user);
      });
  });

router
  .route('/:id/waypoints')
  .get(function(req, res, next) {
    User
      .findById(req.params.id)
      .lean()
      .exec(function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(rest.notFound);
        }
        Waypoint
          .find({ author: user._id })
          .select('id name')
          .lean()
          .exec(function(err, waypoints) {
            if (err) {
              return next(err);
            }
            res.json(waypoints);
          });
      });
  })
  .post(function(req, res, next) {
    User
      .findById(req.params.id)
      .lean()
      .exec(function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(rest.notFound);
        }

        var wp = new Waypoint({
          name: req.body.name,
          author: user._id
        });

        wp.save(function(err) {
          if (err) {
            return next(err);
          }
          res.status(201);
          res.send();
        });
      });
  });
  
module.exports = router;
