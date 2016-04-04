var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
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
      required: true
    },
    last: {
      type: String,
      required: true
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

module.exports = mongoose.model('User', User);
