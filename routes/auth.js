var express = require('express');
var passport = require('passport');
var auth = require('../modules/auth');

var router = express.Router();

router.route('/signin')
  .get(auth('guest'), function(req, res) {
    res.render('pages/auth/signin', { title: 'Sign in', bodyClass: 'signin', message: req.flash('error') });
  })
  .post(auth('guest'), passport.authenticate('signin', {
    successRedirect: '/',
    failureRedirect: '/auth/signin',
    failureFlash: true
  }));

router.route('/signup')
  .get(auth('guest'), function(req, res) {
    res.render('pages/auth/signup', { title: 'Sign up', bodyClass: 'signup', message: req.flash('error') });
  })
  .post(auth('guest'), passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/auth/signup',
    failureFlash: true
  }));

router.route('/signout')
  .get(auth('user'), function(req, res) {
    req.logout();
    res.redirect('/auth/signin');
  });

router.route('/facebook')
  .get(auth('guest'), passport.authenticate('facebook', { scope: ['email'] }));

router.route('/facebook/callback')
  .get(auth('guest'), passport.authenticate('facebook', { 
    successRedirect: '/',
    failureRedirect: '/auth/signin',
    failureFlash: true
  }));

router.route('/github')
  .get(auth('guest'), passport.authenticate('github'));

router.route('/github/callback')
  .get(auth('guest'), passport.authenticate('github', { 
    successRedirect: '/',
    failureRedirect: '/auth/signin',
    failureFlash: true
  }));

module.exports = router;
