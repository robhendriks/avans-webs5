var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Waypoint = new Schema({
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Waypoint', Waypoint);
