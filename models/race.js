var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Waypoint = require('./waypoint');

var Race = new Schema({
  name: {
    type: String,
    required: true
  },
  waypoints: [{
    type: Waypoint.schema
  }]
});

module.exports = mongoose.model('Race', Race);
