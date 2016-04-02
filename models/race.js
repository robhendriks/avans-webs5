var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Race = new Schema({
  name: {
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
  }]
});

module.exports = mongoose.model('Race', Race);
