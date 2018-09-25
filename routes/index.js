const express = require('express');
const router = express();
const nodemailer = require('nodemailer');
const {ensureNotAuthenticated,ensureIsAuthenticated} = require('../helpers/auth');

//index route
router.get('/', (req, res) => {
  const title = 'Hello '
  res.render('index', { title: title }); //didn't really use it <yet>
});


router.get('/404', (req, res) => {
  res.render('404');
});
router.get('/about', (req, res) => {
  res.render('About');
});
router.get('/index2', (req, res) => {
  res.render('index2');
});
router.get('/contact', (req, res) => {
  res.render('contact');
});
router.post("/send", (req, res) => {
  const output = `
  <p>Vous avez une nouvelle demande de contact</p>
  <h3>Details</h3>
  <ul>  
    <li>Nom: ${req.body.name}</li>
    <li>Pays: ${req.body.pays}</li>
    <li>Email: ${req.body.email}</li>
    <li>Telephone: ${req.body.phone}</li>
  </ul>
  <h3>Message</h3>
  <p>${req.body.message}</p>
  
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
      ciphers:'SSLv3'
    }
  });
  // setup email data with unicode symbols
  let mailOptions = {
    from: '"ikkiss groupe" <testkoala@outlook.fr>', // sender address
    to: 'logolepsy.insta@gmail.com', // list of receivers
    subject: 'contact form', // Subject line
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
    req.flash('success_msg', 'Email has been sent');

    res.render('contact');
  });
})


// catch 404 and forward to error handler
router.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
 
// production error handler
// no stacktraces leaked to user
router.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  res.status(err.status || 500);
  res.render('404', {
    message: err.message,
    error: {}
  });
});

module.exports = router