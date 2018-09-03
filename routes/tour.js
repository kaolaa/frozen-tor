const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ARpjSkl3xPy-GS7GoWGPOCK_tS3zyEDy8izogz_S-OGsB52yI5ISvPYSdkfXwFwy6APoL8X7Jc50T4Tj',
    'client_secret': 'EDhOctw7OuEKhLZ0svWnFYlcnNpTKlDsSJlidZNiFvSzMYGesQpeLLqvKnmie29XO2QrAG11Ga00bEMT'
});

// Load User Model
require('../models/User');
const User = mongoose.model('users');

router.get('/booking', (req, res) => {
    res.render('tour/booking');
});
router.get('/success', (req, res) => {
    const payerID = req.query.PayerID;
    const paymentId = req.query.paymentId;

    var execute_payment_json = {
        "payer_id": payerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send("Success");
        }
    });
});
router.get('/cancel', (req, res) => res.send('Cancelled'));
router.get('/reserver',(req, res) => {
    res.render('tour/reserver');
});

router.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:5000/tour/success",
            "cancel_url": "http://localhost:5000/tour/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "test tout",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "my first paypal transaction."
        }]
    };


    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

});
module.exports = router;