var util = require('util');
var express = require('express');
var rest = require('../helpers/rest');

var router = express.Router();

var User = require('../models/user');
var Waypoint = require('../models/waypoint');
var Race = require('../models/race');

router
  .route('/')
  .get(function(req, res, next) {
    User
      .find()
      .exec(function(err, users) {
        if (err) {
          return next(err);
        }
        if (req.isHtml)
          res.render('widgets/user-list', { layout: false, users: users });
        else
          res.json(users);
      });
  });

router
  .route('/:id')
  .get(function(req, res, next) {
    User
      .findById(req.params.id)
      .exec(function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(rest.notFound);
        }
        if (req.isHtml)
          res.render('widgets/user-single', { layout: false, user: user });
        else
          res.json(user);
      });
  });

router
  .route('/:id/races')
  .get(function(req, res, next) {
    User
      .findById(req.params.id)
      .exec(function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(rest.notFound);
        }
        Race
          .find({ author: user._id })
          .exec(function(err, races) {
            if (err) {
              return next(err);
            }
            if (req.isHtml)
              res.render('widgets/race-list', { layout: false, races: races });
            else
              res.json(races);
          });
      });
  })
  .post(function(req, res, next) {
    User
      .findById(req.params.id)
      .exec(function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(rest.notFound);
        }

        req.body.author = user._id;
        var rc = new Race(req.body);

        rc.save(function(err) {
          if (err) {
            return next(err);
          }
          res.status(201);
          res.send();
        });
      });
  });

router
  .route('/:id/waypoints')
  .get(function(req, res, next) {
    User
      .findById(req.params.id)
      .exec(function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(rest.notFound);
        }
        Waypoint
          .find({ author: user._id })
          .exec(function(err, waypoints) {
            if (err) {
              return next(err);
            }
            if (req.isHtml)
              res.render('widgets/waypoint-list', { layout: false, waypoints: waypoints });
            else
              res.json(waypoints);
          });
      });
  })
  .post(function(req, res, next) {
    User
      .findById(req.params.id)
      .exec(function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(rest.notFound);
        }

        req.body.author = user._id;
        var wp = new Waypoint(req.body);

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
