var crypto = require('crypto');

var FacebookStrategy = require('passport-facebook');
var GitHubStrategy = require('passport-github').Strategy;

var User = require('../models/user');

module.exports = function(app, passport) {
  
  passport.use(new GitHubStrategy({
      clientID: 'fc106965d5ee5509053a',
      clientSecret: '67531470a1eac5fa0483dedc006e60f305134181',
      callbackURL: 'http://localhost:3000/auth/github/callback'
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({
        provider: 'github',
        providerId: profile.id,
      }).exec()
        .then(function(user) {
          if (user) {
            return done(null, user);
          }

          var name = profile.displayName.split(' ', 2);
          var firstName = (name.length > 0 ? name[0] : 'John');
          var lastName = (name.length > 1 ? name[1] : 'Doe');

          return new User({
            email: profile.username + '@pubcrawl.co',
            password: crypto.randomBytes(32).toString('hex'),
            name: {
              first: firstName,
              last: lastName
            },
            provider: 'github',
            providerId: profile.id,
            roles: ['user']
          }).save();
        })
        .then(function(user) {
          console.log(user);
          done(null, user);
        })
        .catch(function(err) {
          done(err);
        });
    }
  ));

  passport.use(new FacebookStrategy({
      clientID: '490684884448016',
      clientSecret: '8c93e824cc90a746653d1c0efc3b40e3',
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'email']
    },
    function(accessToken, refreshToken, profile, done) {
      User
        .findOne({
          provider: 'facebook',
          providerId: profile.id
        })
        .exec(function(err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, user);
          }

          var email = profile.emails[0].value;

          User
            .findOne({ email: email })
            .exec(function(err, user) {
              if (err) {
                return done(err);
              }
              if (user) {
                return done(null, false, { message: 'Email address already in use.' });
              }

              var password = crypto.randomBytes(32).toString('hex');
              var name = profile.displayName.split(' ', 2);

              var newUser = new User({
                email: email,
                password: password,
                name: {
                  first: name[0],
                  last: name[1]
                },
                provider: 'facebook',
                providerId: profile.id,
                roles: ['user']
              });

              newUser.save(function(err) {
                if (err) {
                  if (err.errors) {
                    return done(null, false, { message: err.message });
                  }
                  return done(err);
                }
                return done(null, newUser);
              });
            });
        });
    }
  ));
};
