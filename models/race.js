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
  created: {
    type: Date,
    default: Date.now
  }
});

Race.plugin(paginate);

module.exports = mongoose.model('Race', Race);
