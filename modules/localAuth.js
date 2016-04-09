var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(app, passport) {

  app.use(function(req, res, next) {
    if (req.isAuthenticated()) {
      req.user.isAdmin = (req.user.roles.indexOf('admin') !== -1);
    }
    next();
  });

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User
      .findById(id)
      .exec(function(err, user) {
        done(err, user);
      });
  });

  passport.use('signin', new LocalStrategy({
      usernameField: 'email'
    },
    function(email, password, done) {
      User
        .findOne({ email: email })
        .exec(function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user || !user.verifyPassword(password)) {
            return done(null, false, { message: 'Incorrect email address and/or password.' });
          }
          done(null, user);
        })
    }
  ));

  passport.use('signup', new LocalStrategy({ 
      usernameField: 'email',
      passReqToCallback: true 
    },
    function(req, email, password, done) {
      User
        .findOne({ email: email })
        .exec(function(err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, false, { message: 'Email address already in use.' });
          }
          
          var newUser = new User({
            email: email,
            password: password,
            name: {
              first: req.body.firstName,
              last: req.body.lastName
            },
            provider: 'local',
            roles: ['user']
          });

          newUser.save(function(err) {
            if (err) {
              if (err.errors) {
                return done(null, false, { message: err.message });
              }
              return done(err);
            }
            done(null, newUser);
          });
        });
    }
  ));

};
