var router = require('express').Router();

var filter = require('../../helpers/filter');
var rest = require('../../helpers/rest');

router.use(filter);

router.use('/users', require('./users'));
router.use('/waypoints', require('./waypoints'));
router.use('/races', require('./races'));

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
