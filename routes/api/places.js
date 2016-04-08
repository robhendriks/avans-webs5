var router = require('express').Router();

var Place = require('../../models/place');

router.route('/search')
  .get(function(req, res, next) {
    Place.search(req.query, function(err, radar) {
      if (err) {
        return next(err);
      }
      res.json(radar);
    });
  });

module.exports = router;
