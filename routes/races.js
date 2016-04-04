var express = require('express');
var rest = require('../helpers/rest');

var router = express.Router();

var User = require('../models/user');
var Race = require('../models/race');

var optOut = '-salt -hashedPassword -provider -providerId';

router
  .route('/')
  .get(function(req, res, next) {
    Race
      .find()
      .populate('author', optOut)
      .exec(function(err, races) {
        if (err) {
          return next(err);
        }
        if (req.isHtml)
          res.render('widgets/race-list', { layout: false, races: races });
        else
          res.json(races);
      });
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
  .route('/:id')
  .get(function(req, res, next) {
    Race
      .findById(req.params.id)
      .populate('author', optOut)
      .exec(function(err, race) {
        if (err) {
          return next(err);
        }
        if (!race) {
          return next(rest.notFound);
        }
        if (req.isHtml)
          res.render('widgets/race-single', { layout: false, race: race });
        else
          res.json(race);
      });
  })
  .delete(function(req, res, next) {
    Race
      .findByIdAndRemove(req.params.id)
      .exec(function(err, race) {
        if (err) {
          return next(err);
        }
        if (!race) {
          return next(rest.notFound);
        }
        res.send();
      });
  });

module.exports = router;
