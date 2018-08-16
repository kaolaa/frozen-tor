const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const key = require('./keys') ;


// load user model
const User = mongoose.model('users');

module.exports = function(passport){
  passport.use(
    new GoogleStrategy({
      clientID: key.googleClientID,
      clientSecret: key.googleClientSecret,
      callbackURL:'/auth/google/callback',
      proxy: true
    }, (accessToken, refreshToken, profile, done)=>{
      // console.log(accessToken);
      // console.log(profile);

      const image = profile.photos[0].value.substring(0,profile.photos[0].value.indexof('?'));

      const newUser = {
        googleID: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.email[0].value,
        image: image
      }

      // Check for existing user
      User.findOne({
        googleID: profile.id
      }).then(user => {
        if (user) {
          // Return user
          done(null,user);
        } else {
          // Create user
          new User(newUser)
          .save()
          .then(user => done(null,user));
        }
      })
    } )
  )
}

//