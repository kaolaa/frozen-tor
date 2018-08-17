const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSchema = new Schema({
  googleID: {
    type: String,
  },
  email: {
    type: String,
    required: true
  },
  FirstName: {
    type: String,
  },
  LastName: {
    type: String,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
});

//Create collection and add schema
mongoose.model('users',UserSchema);