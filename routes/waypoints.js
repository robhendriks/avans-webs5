var util = require('util');
var express = require('express');
var rest = require('../helpers/rest');

var router = express.Router();

var Waypoint = require('../models/waypoint');
var User = require('../models/user');

router
  .route('/')
  .get(function(req, res, next) {
    Waypoint
      .find()
      .select('id name author')
      .populate('author', 'id email name')
      .exec(function(err, waypoints) {
        if (err) {
          return next(err);
        }
        res.json(waypoints);
      })
  })
  .post(function(req, res, next) {
    User
      .findById(req.body.author)
      .exec(function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(rest.badRequest);
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
      })
  });

router
  .route('/:id')
  .get(function(req, res, next) {
    Waypoint
      .findById(req.params.id)
      .select('id name author')
      .populate('author', 'id email name')
      .exec(function(err, waypoint) {
        if (err) {
          return next(err);
        }
        if (!waypoint) {
          return next(rest.notFound);
        }
        res.json(waypoint);
      })
  })
  .delete(function(req, res, next) {
    Waypoint
      .findByIdAndRemove(req.params.id)
      .exec(function(err, waypoint) {
        if (err) {
          return next(err);
        }
        if (!waypoint) {
          return next(rest.notFound);
        }
        res.send();
      })
  });
  
module.exports = router;
