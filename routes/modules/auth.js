const express = require('express');
const router = express.Router();

const passport = require('passport');

// Redirect users to Facebook login for authentication
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile'] // Specify the requested user data from Facebook
}));

// Facebook callback route after successful authentication
router.get('/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}));

module.exports = router;
