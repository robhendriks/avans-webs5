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
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Waypoint', Waypoint);
