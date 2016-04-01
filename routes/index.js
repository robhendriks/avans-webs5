var express = require('express');
var auth = require('../modules/auth');

var router = express.Router();

router
  .route('/')
  .get(auth('user'), function(req, res) {
    res.render('index', { title: 'Dashboard', user: req.user });
  });

router
  .route('/waypoints')
  .get(auth('user'), function(req, res) {
    res.render('waypoints', { title: 'Waypoints', user: req.user });
  });

router
  .route('/races')
  .get(auth('user'), function(req, res) {
    res.render('races', { title: 'Races', user: req.user });
  });

module.exports = router;
