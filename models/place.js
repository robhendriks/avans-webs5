var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Place = new Schema({
  lat: {
    type: Number
  },
  lng: {
    type: Number
  },
  places: [{
    lat: Number,
    lng: Number,
    name: String,
    icon: String
  }]
});

var appConfig = require('../config/app');
var googleplaces = require('googleplaces')(appConfig.google.apiKey, 'json');
var nearBySearch = googleplaces.nearBySearch;

Place.statics.search = function(query, cb) {
  if (typeof query !== 'object') {
    throw new TypeError('query expected object');
  }
  if (typeof cb !== 'function') {
    throw new TypeError('callback expected function');
  }
  if (!query.lat || !query.lng) {
    throw new Error('missing parameter(s)');
  }

  var model = this.model('Place');

  model.findOne(query).exec()
    .then(function(radar) {
      if (radar) {
        return cb(null, radar);
      }

      var params = {
        location: [query.lat, query.lng],
        type: 'cafe',
        radius: 1000
      };

      nearBySearch(params, function(err, data) {
        if (err) {
          throw err;
        }

        var places = data.results.map(function(result) {
          return {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            name: result.name,
            icon: result.icon
          };
        });

        new model({
          lat: query.lat,
          lng: query.lng,
          places: places
        }).save()
          .then(function(place) {
            cb(null, place);
          })
          .catch(function(err) {
            cb(err);
          });
      });
    })
    .catch(function(err) {
      cb(err);
    });
};

module.exports = mongoose.model('Place', Place);
