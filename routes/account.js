const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Load User Model
require('../models/User');
const User = mongoose.model('users');


router.get('/overview', (req, res) => {
  res.render('account/overview');
});
router.get('/history', (req, res) => {
  res.render('account/history');
});
router.get('/profil', (req, res) => {
  res.render('account/profil');
});

module.exports = router;