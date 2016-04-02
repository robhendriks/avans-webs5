var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Waypoint = new Schema({
  name: {
    type: String,
    required: true
  },
  geo: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Waypoint', Waypoint);
