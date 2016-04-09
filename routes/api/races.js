var rest = require('../../helpers/rest');
var resolve = require('../../helpers/error').Resolve;

var Race = require('../../models/race');
var Waypoint = require('../../models/waypoint');

var router = require('express').Router();

router.route('/')
  .get(function(req, res, next) {
    var promise;
    if (req.query.page) {
      promise = Race.paginate(req.find, {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        populate: 'author',
        sort: req.sort
      });
    } else {
      promise = Race.find(req.find)
        .populate('author')
        .sort(req.sort)
        .exec();
    }

    promise
      .then(function(races) {
        res.json(races);
      })
      .catch(function(err) {
        next(err);
      });
  });

router.route('/autocomplete')
  .get(function(res, res, next) {
    Race.find()
      .select('id name')
      .sort({name: 1})
      .exec()
      .then(function(races) {
        res.json(races);
      })
      .catch(function(err) {
        next(err);
      });
  });

router.route('/:id')
  .get(function(req, res, next) {
    Race.findById(req.params.id)
      .exec()
      .then(function(race) {
        if (!race) {
          throw rest.notFound;
        }
        res.json(race);
      })
      .catch(function(err) {
        next(err);
      });
  })
  .delete(function(req, res, next) {
    Race.findById(req.params.id)
      .exec()
      .then(function(race) {
        if (!race) {
          throw rest.notFound;
        }
        return race.remove();
      })
      .then(function(race) {
        return Waypoint.remove({race: race.id});
      })
      .then(function() {
        res.sendStatus(204);
      })
      .catch(function(err) {
        next(err);
      });
  });

router.route('/:id/waypoints')
  .get(function(req, res, next) {
    Race.findById(req.params.id)
      .populate('waypoints')
      .exec()
      .then(function(race) {
        if (!race) {
          throw rest.notFound;
        }

        req.find.race = race.id;

        if (req.query.page) {
          return Waypoint.paginate(req.find, {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            sort: req.sort
          });
        }

        return Waypoint.find(req.find)
          .sort(req.sort)
          .exec();
      })
      .then(function(waypoints) {
        res.json(waypoints);
      })
      .catch(function(err) {
        next(err);
      });
  })
  .post(function(req, res, next) {
    Race.findById(req.params.id).exec()
      .then(function(race) {
        if (!race) {
          throw rest.notFound;
        }
        req.body.race = race.id;
        return new Waypoint(req.body).save();
      })
      .then(function(waypoint) {
        res.sendStatus(201);
      })
      .catch(function(err) {
        resolve(err, next);
      });
  });

module.exports = router;
