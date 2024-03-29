var crypto = require('crypto');
var mongoose = require('mongoose');

var paginate = require('mongoose-paginate');
var validate = require('mongoose-validator');

var Schema = mongoose.Schema;

var emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Invalid email address'
  })
];

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [2, 30],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

var User = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: emailValidator
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  name: {
    first: {
      type: String,
      required: true,
      validate: nameValidator
    },
    last: {
      type: String,
      required: true,
      validate: nameValidator
    }
  },
  provider: {
    type: String,
    required: true
  },
  providerId: {
    type: String
  },
  roles: [{
    type: String
  }],
  created: {
    type: Date,
    default: Date.now
  }
});

User.virtual('password')
  .get(function() {
    return this.hashedPassword;
  })
  .set(function(password) {
    this.salt = crypto.randomBytes(32).toString('hex');
    this.hashedPassword = this.hashPassword(password);
  });

User.virtual('userId')
  .get(function() {
    return this._id;
  });

User.virtual('name.full')
  .get(function() {
    return this.name.first + ' ' + this.name.last;
  });

User.methods.hashPassword = function(password) {
  return crypto.createHmac('sha1', this.salt)
    .update(password)
    .digest('hex');
};

User.methods.verifyPassword = function(password) {
  return this.hashPassword(password) === this.hashedPassword;
};

User.plugin(paginate);

module.exports = mongoose.model('User', User);
