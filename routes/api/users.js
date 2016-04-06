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
      query = User.paginate({}, {
        page: req.query.page,
        limit: 10,
        sort: '-created'
      });
    } else {
      query = User.find({}).exec();
    }

    query.then(function(users) {
        if (req.isHtml) {
          users.layout = false;
          res.render('partials/user/list', users);
        } else {
          res.json(users);
        }
      }).catch(function(err) {
        resolve(err, next);
      });
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
        resolve(err, next);
      });
  });

router.route('/:id/races')
  .get(function(req, res, next) {
    User.findById(req.params.id).exec()
      .then(function(user) {
        if (!user) {
          throw rest.notFound;
        }
        
        if (!req.query.page) {
          return Race.find({}).exec();
        }

        return Race.paginate({}, {
          page: req.query.page,
          limit: 10,
          sort: '-author -created'
        });
      })
      .then(function(races) {
        if (req.isHtml) {
          races.layout = false;
          res.render('partials/race/list', races);
        } else {
          res.json(races);
        }
      })
      .catch(function(err) {
        resolve(err, next);
      });
  })
  .post(function(req, res, next) {
    User.findById(req.params.id).exec()
      .then(function(user) {
        if (!user) {
          throw rest.notFound;
        }
        req.body.author = user._id;
        return new Race(req.body).save();
      })
      .then(function(race) {
        res.sendStatus(201);
      })
      .catch(function(err) {
        resolve(err, next);
      });
  });

router
  .route('/:id/waypoints')
  .get(function(req, res, next) {
    next();
  })
  .post(function(req, res, next) {
    next();
  });
  
module.exports = router;
