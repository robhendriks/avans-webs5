var router = require('express').Router();

var rest = require('../../helpers/rest');
var resolve = require('../../helpers/error').Resolve;

var User = require('../../models/user');
var Waypoint = require('../../models/waypoint');
var Race = require('../../models/race');

router.route('/')
  .get(function(req, res, next) {
    var query;
    if (req.query.page) {
      query = Race.paginate({}, {
        page: req.query.page,
        limit: 10,
        sort: '-created',
        populate: {
          path: 'author',
          select: '-salt -hashedPassword'
        }
      });
    } else {
      query = Race.find({}).exec();
    }

    query.then(function(races) {
        if (req.isHtml) {
          races.layout = false;
          res.render('partials/race/list', races);
        } else {
          res.json(races);
        }
      }).catch(function(err) {
        resolve(err);
      });
  });

router.route('/:id')
  .get(function(req, res, next) {
    Race.findById(req.params.id)
      .populate('author', '-salt -hashedPassword')
      .exec()
      .then(function(race) {
        if (!race) {
          throw rest.notFound;
        }
        res.json(race);
      })
      .catch(function(err) {
        resolve(err, next);
      });
  })
  .delete(function(req, res, next) {
    Race.findByIdAndRemove(req.params.id)
      .exec()
      .then(function(race) {
        if (!race) {
          throw rest.notFound;
        }
        res.sendStatus(204);
      })
      .catch(function(err) {
        resolve(err, next);
      });
  });

router.route('/:id/waypoints')
  .get(function(req, res, next) {
  	Race.findById(req.params.id)
  		.populate({
  			path: 'waypoints',
  			populate: {
          path: 'author', 
          select: '-salt -hashedPassword'
        }
  		})
  		.exec()
  		.then(function(race) {
  			if (!race) {
  				throw rest.notFound;
  			}
  			res.json(race.waypoints);
  		})
  		.catch(function(err) {
  			resolve(err, next);
  		});

  })
  .post(function(req, res, next) {
  	var tmp;
    Race.findById(req.params.id)
    	.exec()
      .then(function(race) {
        if (!race) { 
        	throw rest.notFound; 
        }
        tmp = race;
        return new Waypoint(req.body).save();
      })
      .then(function(waypoint) {
      	tmp.waypoints.push(waypoint);
      	return tmp.save();
      })
      .then(function() {
      	res.sendStatus(201);
      })
      .catch(function(err) {
      	resolve(err, next);
      });
  });

module.exports = router;
