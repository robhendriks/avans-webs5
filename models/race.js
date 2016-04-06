var mongoose = require('mongoose');
var paginate = require('mongoose-paginate');
var validate = require('mongoose-validator');


var Schema = mongoose.Schema;

var Race = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  waypoints: [{
    type: Schema.Types.ObjectId,
    ref: 'Waypoint'
  }],
  created: {
    type: Date,
    default: Date.now
  },
  state: {
    type: String,
    enum: ['none', 'playing', 'ended'],
    default: 'none'
  }
});

Race.plugin(paginate);

module.exports = mongoose.model('Race', Race);
