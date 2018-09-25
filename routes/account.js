const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
var newcities = require('full-countries-cities');
const bcrypt = require('bcryptjs');
const tourfound = "";
const thetour = "";
const nodemailer = require('nodemailer');
const {ensureNotAuthenticated,ensureIsAuthenticated} = require('../helpers/auth');


// Load User Model
require('../models/User');
const User = mongoose.model('users');
// Load booking Model
require('../models/booking');
const bookingmongo = mongoose.model('Booking');

router.get('/overview', ensureIsAuthenticated , (req, res) => {
  bookingmongo.find({ ClientID: res.locals.user.id })
    .limit(3)
    .sort({ date: 'desc' })
    .then(bookingfound => {
      res.render('account/overview', {
        bookingfound: bookingfound
      });
    });
});

router.get('/history', ensureIsAuthenticated , (req, res) => {
  // tour.find({}).then(tourfound = tours);
  bookingmongo.find({
    ClientID: res.locals.user.id
  })
    .sort({ date: 'desc' })
    .then(bookingfound => {
      res.render('account/history', {
        bookingfound: bookingfound
        //, tourfound : tourfound , thetour : thetour
      });
    });
  //   _id: "5b9a707a2d710b1a9ccf906e"
  // }).then(bookingfound => res.render('account/history', { booking: bookingfound }));
});

router.get('/profil',ensureIsAuthenticated , (req, res) => {
  res.render('account/profil');
});
router.get('/change-password', ensureIsAuthenticated , (req, res) => {
  res.render('account/change-password');
});

// get cities
router.get('/test/:id', (req, res) => {
  test = req.params.id;
  cities = newcities.getCities(test);
  res.send(cities);
});

//edit profil
router.put('/profil', (req, res) => {
  User.findOne({
    _id: res.locals.user.id
  }).then(user => {
    user.FirstName = req.body.nom;
    user.LastName = req.body.prenom;
    user.email = req.body.email;
    user.telephone = req.body.telephone;
    user.country = req.body.country;
    user.city = req.body.city;
    user.Dateofbirth = req.body.Dateofbirth

    user.save().then(user => {
      req.flash('success_msg', 'Profil modifier');
      res.redirect('/account/overview');
    })
  });
});



//edit password

router.put('/change-password', (req, res) => {
  let errors = [];

  if (req.body.newpassword !== req.body.password2) {
    errors.push({ text: 'Les mots de passe saisis ne sont pas identiques' });
  }

  if (req.body.newpassword.length < 4) {
    errors.push({ text: 'Le mot de passe doit contenir aux moins 4 caractères ' });
  }
  if (errors.length > 0) {
    res.render('account/change-password', {
      errors: errors,
    });
  } else {
    User.findOne({ _id: res.locals.user.id })
      .then(user => {
        if (user) {
          // Match password
          bcrypt.compare(req.body.currentpassword, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
              req.flash('error_msg', 'Désolé, mot de passe incorrect ');
              res.redirect('/account/change-password');
            } else {
              user.password = req.body.newpassword,
                bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) throw err;
                    user.password = hash;

                    user.save(function (error) {
                      if (error) {
                        console.log(err);
                        return;
                      }
                      const output = `
                      <p>Chere ${res.locals.user.LastName},<br> Votre mot de passe vient d'etre changer
                      <br>
                      Si ce n'etait pas vous , veuillez nous contacter 
                      localhost.com
                      </p>
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
                        to: res.locals.user.email, // list of receivers
                        subject: 'Votre mot de passe a bien ete changer', // Subject line
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



                    
                      req.flash('success_msg', 'Votre mot de passe a bien ete modifié ');
                      res.redirect('/account/change-password');
                    });



                  });
                });
            }
          })

        }
      })
  }


});


module.exports = router;