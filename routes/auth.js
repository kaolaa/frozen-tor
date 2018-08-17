const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load User Model
require('../models/User');
const User = mongoose.model('users');

// Mail auth
router.post('/mail', (req, res, next) => {
  passport.authenticate('local', {
    failureRedirect: '/auth/mail',
    failureFlash: true,
    successRedirect: '/'

  })(req, res, next);
  // Successful authentication, redirect home.
  // res.redirect('/');
});

// Google auth 
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
router.get('/verify', (req, res) => {
  if (req.user) {
    console.log(req.user);
  } else {
    console.log('Not Auth')
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/mail', (req, res) => {
  res.render('auth/mail', { layout: false });
});

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});


// Register from post
router.post('/signup', (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({ text: 'Passwords do not match' });
  }

  if (req.body.password.length < 4) {
    errors.push({ text: 'Password must be at least 4 characters' });
  }

  if (errors.length > 0) {
    res.render('auth/signup', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          req.flash('error_msg', 'Email already registered');
          res.redirect('/auth/signup');
        } else {
          const newUser = new User({
            FirstName: req.body.nom,
            LastName: req.body.prenom,
            email: req.body.email,
            password: req.body.password,
          });
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;

              newUser.save(function (error) {
                if (error) {
                  console.log(err);
                  return;
                }
                req.flash('success_msg', 'User add');
                res.redirect('/auth/mail');
              });

         

            });
          });
        }
      });
  }


});

module.exports = router;