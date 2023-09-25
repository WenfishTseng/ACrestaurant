const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/user');

module.exports = app => {
  // Initialize passport and session middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy: Authenticate using email and password
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passReqToCallback: true
    },
    (req, email, password, done) => {
      // Find the user with the provided email
      User.findOne({ email })
        .then(user => {
          // If user not found, return 'false'
          if (!user) {
            return done(null, false, { message: 'This email is not registered.' });
          }
          // Compare password with the hashed password in the database
          return bcrypt.compare(password, user.password).then(isMatch => {
            // If passwords do not match, return 'false'
            if (!isMatch) {
              return done(null, false, { message: 'Email or password is incorrect.' });
            }
            // If passwords match, return the user object
            return done(null, user);
          });
        })
        .catch(err => done(err, false));
    }
  ));

  // Facebook Strategy: Authenticate using Facebook account
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName']
  }, (accessToken, refreshToken, profile, done) => {
    const { name, email } = profile._json;
    // Find the user with the Facebook account email
    User.findOne({ email })
      .then(user => {
        if (user) {
          // If user found, return the user object
          return done(null, user);
        } else {
          // If user not found, create a new user with random password and Facebook data
          const randomPassword = Math.random().toString(36).slice(-8);
          bcrypt
            .genSalt(10)
            .then(salt => bcrypt.hash(randomPassword, salt))
            .then(hash => User.create({
              name,
              email,
              password: hash
            }))
            .then(user => done(null, user))
            .catch(err => done(err, false));
        }
      });
  }));

  // Serialize and Deserialize user data for sessions
  passport.serializeUser((user, done) => {
    // Store user ID in the session
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    // Retrieve user data from the database using the stored ID
    User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null));
  });
}