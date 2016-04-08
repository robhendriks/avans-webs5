var mongoose = require('mongoose');

var paginate = require('mongoose-paginate');
var validate = require('mongoose-validator');

var Schema = mongoose.Schema;

var Waypoint = new Schema({
  name: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    default: 0
  },
  lng: {
    type: Number,
    default: 0
  },
  race: {
    type: Schema.ObjectId,
    ref: 'Race',
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

Waypoint.plugin(paginate);

module.exports = mongoose.model('Waypoint', Waypoint);
