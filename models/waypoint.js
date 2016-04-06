var mongoose = require('mongoose');
var validate = require('mongoose-validator');

var Schema = mongoose.Schema;

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 50],
    message: '{PATH} should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

var Waypoint = new Schema({
  name: {
    type: String,
    required: true,
    validate: nameValidator
  },
  geo: {
    lat: {
      type: Number,
      default: 0
    },
    lng: {
      type: Number,
      default: 0
    }
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Waypoint', Waypoint);
