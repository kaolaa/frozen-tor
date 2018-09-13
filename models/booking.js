const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const BookingSchema = new Schema({
  ClientID: {
    type: String,
    required: true
  },
  TourID: {
    type: String,
    required: true
  },
  TripID: {
    type: String,
  },
  Aeroport: {
    type: String,
  },
  NbrKids: {
    type: Number,
  },
  NbrAdults: {
    type: Number,
  },
  NbrRooms: {
    type: Number ,
  },
  Food: {
    type: String,
  },
  ExtraActivity : {
    type: String,
  },
  Message : {
    type: String,
  },
  IdTrasaction: {
    type: String,
  },
  PaymentMethod: {
    type: String,
  },
  BookingDate: {
    type: String,
  },
  Arrival: {
    type: String,
  },
  Leaving: {
    type: String,
  },
  Canceled : {
    type: String,
  },
});

//Create collection and add schema
mongoose.model('Booking',BookingSchema);

// bcrypt middleware
BookingSchema.pre('save', function(next){
  var user = this;
  next()
})