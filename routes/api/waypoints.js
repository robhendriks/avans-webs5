var rest = require('../../helpers/rest');

var Waypoint = require('../../models/waypoint');

var router = require('express').Router();

router.route('/')
  .get(function(req, res, next) {
    var promise;
    if (req.query.page) {
      promise = Waypoint.paginate(req.find, {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: req.sort
      });
    } else {
      promise = Waypoint.find(req.find)
        .sort(req.sort)
        .exec();
    }
    
    promise
      .then(function(waypoints) {
        res.json(waypoints);
      })
      .catch(function(err) {
        next(err);
      });
  });

router.route('/:id')
  .get(function(req, res, next) {
    Waypoint.findById(req.params.id).exec()
      .then(function(waypoint) {
        if (!waypoint) {
          throw rest.notFound;
        }
        res.json(waypoint);
      })
      .catch(function(err) {
        next(err);
      });
  })
  .delete(function(req, res, next) {
    Waypoint.findById(req.params.id).exec()
      .then(function(waypoint) {
        if (!waypoint) {
          throw rest.notFound;
        }
        return waypoint.remove();
      })
      .then(function(waypoint) {
        res.sendStatus(204);
      })
      .catch(function(err) {
        next(err);
      });
  });

module.exports = router;
