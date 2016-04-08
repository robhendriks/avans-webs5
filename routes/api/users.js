var rest = require('../../helpers/rest');
var resolve = require('../../helpers/error').Resolve;

var User = require('../../models/user');
var Race = require('../../models/race');

var router = require('express').Router();

router.route('/')
  .get(function(req, res, next) {

    var promise;
    if (req.query.page) {
      promise = User.paginate(req.find, {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: req.sort
      });
    } else {
      promise = User.find(req.find)
        .sort(req.sort)
        .exec();
    }

    promise
      .then(function(users) {
        res.json(users);
      })
      .catch(function(err) {
        next(err);
      });
  });

router.route('/whoami')
  .get(function(req, res, next) {
    if (!req.isAuthenticated() || !req.user) {
      return next(rest.unauthorized);
    }
    res.json(req.user);
  });

router.route('/:id')
  .get(function(req, res, next) {
    User.findById(req.params.id).exec()
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

router.route('/:id/races')
  .get(function(req, res, next) {
    User.findById(req.params.id).exec()
      .then(function(user) {
        if (!user) {
          throw rest.notFound;
        }
        req.find.author = user.id;

        if (req.query.page) {
          return Race.paginate(req.find, {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            sort: req.sort
          });
        }

        return Race.find(req.find)
          .sort(req.sort)
          .exec();
      })
      .then(function(races) {
        res.json(races);
      })
      .catch(function(err) {
        next(err);
      });
  })
  .post(function(req, res, next) {
    User.findById(req.params.id).exec()
      .then(function(user) {
        if (!user) {
          throw rest.notFound;
        }

        req.body.author = user.id;
        return new Race(req.body).save();
      })
      .then(function(race) {
        res.sendStatus(201);
      })
      .catch(function(err) {
        resolve(err, next);
      });
  });

router.route('/:id/races/autocomplete')
  .get(function(req, res, next) {
    User.findById(req.params.id).exec()
      .then(function(user) {
        if (!user) {
          throw rest.notFound;
        }
        req.find.author = user.id;
        return Race.find(req.find)
          .select('id name')
          .sort(req.sort)
          .exec();
      })
      .then(function(races) {
        res.json(races);
      })
      .catch(function(err) {
        next(err);
      });
  });

module.exports = router;
