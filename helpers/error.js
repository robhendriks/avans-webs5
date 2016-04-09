var util = require('util');

var Resolver = function(err, cb) {
  this.err = err;
  this.cb = cb;
};

Resolver.prototype = {

  constructor: Resolver,

  resolve: function() {
    if (!this.err.name || this.err.name !== 'ValidationError') {
      return this.cb(this.err);
    }

    var data = {
      message: this.err.message,
      errors: {}
    };

    var eObj, eRes;
    for (var path in this.err.errors) {
      eObj = this.err.errors[path];
      eRes = Resolver.getResolver(eObj.name);
      if (!eRes) {
        data.errors[path] = eObj.name;
        continue;
      }
      data.errors[path] = eRes(eObj);
    }

    var err = new Error();
    err.status = 400;
    err.data = data;
    this.cb(err);
  }

};

Resolver.messages = {
  required: '%s is required'
};

Resolver.getMessage = function(name) {
  return (name in this.messages ? this.messages[name] : null);
};

Resolver.resolvers = {

  CastError: function(err) {
    return util.format('%s is not a valid %s', err.path || '?', err.kind || '?');
  },

  ValidatorError: function(err) {
    var message;
    if (!(message = Resolver.getMessage(err.properties.type))) {
      return err.message;
    }
    return util.format(message, err.path);
  }

};

Resolver.getResolver = function(name) {
  return (name in this.resolvers ? this.resolvers[name] : null);
};

module.exports = {

  Resolve: function(err, cb) {
    new Resolver(err, cb).resolve();
  }

};
