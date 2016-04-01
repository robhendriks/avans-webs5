var express = require('express');
var auth = require('../modules/auth');

var router = express.Router();

router
  .route('/')
  .get(auth('user'), function(req, res) {
    res.render('index', { title: 'Dashboard', user: req.user });
  });

module.exports = router;
