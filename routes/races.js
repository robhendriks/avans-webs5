var router = require('express').Router();

var auth = require('../modules/auth');

var Race = require('../models/race');

router.route('/')
  .get(auth('user'), function(req, res) {
    res.render('pages/race/list', { title: 'Races', user: req.user });
  });

router.route('/:id')
  .get(auth('user'), function(req, res, next) {
    Race.findById(req.params.id)
      .then(function(race) {
        if (!race) {
          return next();
        }
        res.render('pages/race/single', { title: 'Race', user: req.user, race: race._id });
      })
      .catch(function(err) {
        next(err);
      });
  });

module.exports = router;
