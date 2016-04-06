var util = require('util');
var express = require('express');
var rest = require('../../helpers/rest');

var router = express.Router();

var User = require('../../models/user');
var Waypoint = require('../../models/waypoint');
var Race = require('../../models/race');

var optOut = '-salt -hashedPassword -providerId';

router
  .route('/')
  .get(function(req, res, next) {
    var options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sort: '-created'
    };

    User
      .paginate({}, options, function(err, result) {
        if (err) {
          return next(err);
        }
        if (req.isHtml) {
          result.layout = false;
          res.render('widgets/user-list', result);
        }
        else
          res.json(result);
      });
  });

router
  .route('/:id')
  .get(function(req, res, next) {
    User
      .findById(req.params.id)
      .select(optOut)
      .lean()
      .exec(function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(rest.notFound);
        }
        if (req.isHtml) {
          user.layout = false;
          res.render('widgets/user-single', user);
        }
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

        var query = {
          author: user._id
        };
        var options = {
          page: req.query.page || 1,
          limit: req.query.limit || 10,
          sort: '-created'
        };

        Race
          .paginate(query, options, function(err, result) {
            if (err) {
              return next(err);
            }
            if (req.isHtml) {
              result.layout = false;
              res.render('widgets/race-list', result);
            }
            else
              res.json(result);
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
