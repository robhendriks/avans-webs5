var rest = require('../helpers/rest');

var Auth = {

  urls: {
    'default': '/auth/signin',
    'admin': '/',
    'guest': '/'
  },

  getUrl: function(name) {
    return (name in this.urls ? this.urls[name] : this.urls['default']);
  }

};

module.exports = function(arg0, arg1) {

  var self = {};

  self.roles = (typeof arg0 === 'string' ? arg0.split(' ') : []);
  self.redirect = (typeof arg1 === 'boolean' ? arg1 : true);

  self.test = function(roles) {
    for (var i = 0; i < self.roles.length; i++) {
      var role = self.roles[i];
      if (roles.indexOf(role) === -1) {
        return Auth.getUrl(role);
      }
    }
    return false;
  };

  self.express = function(req, res, next) {
    var roles = ['guest'];
    if (req.isAuthenticated()) {
      roles = req.user.roles;
    }
    var url;
    if (!(url = self.test(roles))) {
      return next();
    }
    if (!self.redirect) {
      return next(rest.unauthorized);
    }
    res.redirect(url);
  };

  return self.express;

};
