var crypto = require('crypto');

var FacebookStrategy = require('passport-facebook');

var User = require('../models/user');

module.exports = function(app, passport) {
  
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
