const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const nodemailer = require('nodemailer');
const {ensureNotAuthenticated,ensureIsAuthenticated} = require('../helpers/auth');



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

router.get('/logout', ensureIsAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/mail', ensureNotAuthenticated, (req, res) => {
  res.render('auth/mail', { layout: false });
});

router.get('/signup', ensureNotAuthenticated, (req, res) => {
  res.render('auth/signup');
});


// Register from post
router.post('/signup', (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({ text: 'Les mots de passe saisis ne sont pas identiques' });
  }

  if (req.body.password.length < 4) {
    errors.push({ text: 'Le mot de passe doit contenir aux moins 4 caractères' });
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
          req.flash('error_msg', 'Email déja utilisé');
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
                const output = `
            <p>merci d'avoir rejoindre notre famille </p>
            <h3>Votre inscription a etes effectuer</h3>
            
            
          `;

                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                  host: 'smtp-mail.outlook.com',
                  port: 587,
                  secure: false, // true for 465, false for other ports
                  auth: {
                    user: 'testkoala@outlook.fr', // generated ethereal user
                    pass: '25kokilosoba'  // generated ethereal password
                  },
                  tls: {
                    ciphers: 'SSLv3'
                  }
                });
                // setup email data with unicode symbols
                let mailOptions = {
                  from: '"ikkiss groupe" <testkoala@outlook.fr>', // sender address
                  to: req.body.email, // list of receivers
                  subject: 'inscription reussite', // Subject line
                  text: 'Hello world?', // plain text body
                  html: output // html body
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    return console.log(error);
                  }
                  console.log('Message sent: %s', info.messageId);
                  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                });



                req.flash('success_msg', 'Félicitation vous avez créé votre compte ');
                res.redirect('/auth/mail');
              });



            });
          });
        }
      });
  }


});

module.exports = router;