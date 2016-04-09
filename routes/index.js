var router = require('express').Router();

var resources = require('../resources');
var auth = require('../modules/auth');

router.route('/')
  .get(auth('user'), function(req, res) {
    res.render('pages/index', { title: 'Dashboard', user: req.user });
  });

router.route('/profile')
  .get(auth('user'), function(req, res) {
    res.render('pages/profile', { title: 'Profile', user: req.user });
  });

router.route('/docs')
  .get(function(req, res) {
    res.render('pages/docs', { title: 'Documentation', user: req.user, resources: resources });
  });

router.use('/auth', require('./auth'));
router.use('/races', require('./races'));

module.exports = router;
