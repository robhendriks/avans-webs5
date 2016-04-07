var router = require('express').Router();

var auth = require('../modules/auth');

router.route('/')
  .get(auth('user'), function(req, res) {
    res.render('pages/index', { title: 'Dashboard', user: req.user });
  });

router.use('/auth', require('./auth'));
router.use('/races', require('./races'));

module.exports = router;
