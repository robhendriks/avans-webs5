var express = require('express');
var rest = require('../helpers/rest');

var router = express.Router();

var User = require('../models/user');
var Race = require('../models/race');

var optOut = '-salt -hashedPassword -provider -providerId';

router
  .route('/')
  .get(function(req, res, next) {
    var options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sort: '-created',
      populate: 'author'
    };

    Race
      .paginate({}, options, function(err, result) {
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
      .lean()
      .exec(function(err, race) {
        if (err) {
          return next(err);
        }
        if (!race) {
          return next(rest.notFound);
        }
        if (req.isHtml) {
          race.layout = false;
          res.render('widgets/race-single', race);
        }
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
