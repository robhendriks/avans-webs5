var express = require('express');
var auth = require('../modules/auth');

var router = express.Router();

router.route('/')
  .get(auth('user'), function(req, res) {
    res.render('pages/index', { title: 'Dashboard', user: req.user });
  });

router.route('/users')
  .get(auth('admin'), function(req, res) {
    res.render('pages/users', { title: 'Users', user: req.user });
  });

router.route('/races')
  .get(auth('user'), function(req, res) {
    res.render('pages/races', { title: 'Races', user: req.user });
  });

module.exports = router;
