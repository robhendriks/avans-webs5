var mongoose = require('mongoose');

var paginate = require('mongoose-paginate');
var validate = require('mongoose-validator');

var Schema = mongoose.Schema;

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 30],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

var Race = new Schema({
  name: {
    type: String,
    required: true,
    validate: nameValidator
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
  created: {
    type: Date,
    default: Date.now
  }
});

Race.plugin(paginate);

module.exports = mongoose.model('Race', Race);
