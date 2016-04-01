var Auth = {

  urls: {
    'default': '/auth/signin',
    'guest': '/'
  },

  getUrl: function(name) {
    return (name in this.urls ? this.urls[name] : this.urls['default']);
  }

};

module.exports = function(arg) {

  var self = {};

  self.roles = (typeof arg === 'string' ? arg.split(' ') : []);

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
    res.redirect(url);
  };

  return self.express;

};
