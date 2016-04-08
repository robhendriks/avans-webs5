var rest = require('../../helpers/rest');

var User = require('../../models/user');

var router = require('express').Router();

router.route('/')
  .get(function(req, res, next) {
    User.find(req.find)
      .sort(req.sort)
      .exec()
      .then(function(users) {
        res.json(users);
      })
      .catch(function(err) {
        next(err);
      });
  });

router.route('/:id')
  .get(function(req, res, next) {
    User.findById(req.params.id)
      .exec()
      .then(function(user) {
        if (!user) {
          throw rest.notFound;
        }
        res.json(user);
      })
      .catch(function(err) {
        return next(err);
      });
  });

module.exports = router;
