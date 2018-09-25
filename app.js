const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const exphbs = require('express-handlebars');
const hbs = require('handlebars');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const app = express();
var countries = require('full-countries-cities').getCountryNames();
var cities = require('full-countries-cities');
const nodemailer = require('nodemailer');

// load user model
require('./models/User');


// Passport config 
require('./config/passport')(passport);

//Load routes
const auth = require('./routes/auth');
const account = require('./routes/account');
const tour = require('./routes/tour');
const index = require('./routes/index');


//Load Keys
const key = require('./config/keys');

//map global promise - get rid of warning
mongoose.promise = global.promise;

// Mongoose Connect
mongoose.connect(key.mongoURI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

//Handlebars Middleware 
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Static folder
app.use(express.static(path.join(__dirname, 'public')));

//Methode override middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.countries = countries;
  res.locals.contry = "";
  res.locals.cities = cities.getCities("Morocco").sort();
  next();
});

app.use(cookieParser());
// Express session middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
hbs.registerHelper("math", function (lvalue, operator, rvalue, options) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    "+": lvalue + rvalue,
    "-": lvalue - rvalue,
    "*": lvalue * rvalue,
    "/": lvalue / rvalue,
    "%": lvalue % rvalue
  }[operator];
});

hbs.registerHelper('trimString', function (passedString, start, end) {
  var theString = passedString.substring(start, end);
  return new hbs.SafeString(theString)
});
hbs.registerHelper('numbertomounth', function (string) {
  var nbr = parseInt(string.substring(0, 3));
  var month = "";
  switch (nbr) {

    case 1:
      month = "Janvier";
      break;
    case 2:
      month = "Fevrier";
      break;
    case 3:
      month = "Mars";
      break;
    case 4:
      month = "Avril";
      break;
    case 5:
      month = "May";
      break;
    case 6:
      month = "Juin";
      break;
    case 7:
      month = "Juillet";
      break;
    case 8:
      month = "Aout";
      break;
    case 9:
      month = "Septembre";
      break;
    case 10:
      month = "Octobre";
      break;
    case 11:
      month = "Novembre";
      break;
    case 12:
      month = "Decembre";
      break;
    default:
      month = "Month error";
      break;
  }


  return month;
});

// helper to find the tour
hbs.registerHelper('foundtravel', function (booking, travel, thetour) {
  booking.forEach(bookingfound => {
    travel.forEach(travelfound => {
      if (bookingfound.TourID == travelfound.id) {
        thetour = travelfound;
        return true;
      }
    });
  });
  return false;
});

hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});


// // error handlers

// development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
//     res.status(err.status || 500);
//     res.render('404', {
//       message: err.message,
//       error: err
//     });
//   });
// }



//Use Routes 
app.use('/auth', auth);
app.use('/account', account);
app.use('/tour', tour);
app.use('/', index);


const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});