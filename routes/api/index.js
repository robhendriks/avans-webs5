var router = require('express').Router();
var mongoose = require('mongoose');

var auth = require('../../modules/auth');
var filter = require('../../helpers/filter');
var rest = require('../../helpers/rest');
router.use(filter);

router.use(function(req, res, next) {
	req.htmlPlox = (req.headers['accept'] === 'text/html');
	next();
});

router.use(auth('user', false));
router.use('/users', require('./users'));
router.use('/waypoints', require('./waypoints'));
router.use('/races', require('./races'));
router.use('/places', require('./places'));

router.use(function(req, res, next) {
  next(rest.notFound);
});

router.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: err.data || err.message
  });
});

module.exports = router;
