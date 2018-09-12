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
var countries = require ('full-countries-cities').getCountryNames();
var cities = require ('full-countries-cities');  
hbs.compile("{{clientToken}}",{noEscape:true});

// load user model
require('./models/User');
 

// Passport config 
require('./config/passport')(passport);

//Load routes
const auth = require('./routes/auth');
const account = require('./routes/account');
const tour = require('./routes/tour');
const routes = require('./routes/index');


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
app.use(express.static(path.join(__dirname,'public')));

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
app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.countries = countries;
  res.locals.contry = "";
  res.locals.cities= cities.getCities("Morocco").sort();
  next();
});

app.use(cookieParser());
// Express session middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false 
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function(req,res,next){
  res.locals.user = req.user || null ;
  next();
});

//index route
app.get('/', (req, res) => {
  const title = 'Hello '
  res.render('index', { title: title }); //didn't really use it <yet>
});



app.get('/about', (req, res) => {
  res.render('About');
});

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   var err = new Error('Not Found');

//   err.status = 404;
//   next(err);
// });

// // error handlers

// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });

//Use Routes 
app.use('/auth', auth); 
app.use('/account', account); 
app.use('/tour', tour); 
app.use('/index', routes); 


const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});