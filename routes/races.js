var router = require('express').Router();

var auth = require('../modules/auth');

router.route('/')
  .get(auth('user'), function(req, res) {
    res.render('pages/race/list', { title: 'Dashboard', user: req.user });
  });

router.route('/:id')
  .get(auth('user'), function(req, res) {
    res.render('pages/race/single', { title: 'Race', user: req.user, race: req.params.id });
  });

module.exports = router;
