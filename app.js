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

// load user model
require('./models/User');
 

// Passport config 
require('./config/passport')(passport);

//Load routes
const auth = require('./routes/auth');
const account = require('./routes/account');


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

//Use Routes 
app.use('/auth', auth); 
app.use('/account', account); 


app.get('/about', (req, res) => {
  res.render('About');
});
app.get('/users/test', (req, res) => {
  res.render('users/test');
});

//handlebars if condition
hbs.registerHelper('if_eq', function(a, b, opts) {
  if (a == b) {
      return opts.fn(this);
  } else {
      return opts.inverse(this);
  }
});
// Handlebars.registerHelper('isApplyNow', function(block) {
//   if(this.title == "Apply Now") {
//     return block(this);
//   } else {
//     return block.inverse(this);
//   }
// });



const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});