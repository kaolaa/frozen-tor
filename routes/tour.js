const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk');
const braintree = require('braintree');
const gateway = require('../lib/gateway');
const moment = require('moment');

// Load booking Model
require('../models/booking');
const bookingmongo = mongoose.model('Booking');

var booking = '';

var TRANSACTION_SUCCESS_STATUSES = [
    braintree.Transaction.Status.Authorizing,
    braintree.Transaction.Status.Authorized,
    braintree.Transaction.Status.Settled,
    braintree.Transaction.Status.Settling,
    braintree.Transaction.Status.SettlementConfirmed,
    braintree.Transaction.Status.SettlementPending,
    braintree.Transaction.Status.SubmittedForSettlement
];

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ARpjSkl3xPy-GS7GoWGPOCK_tS3zyEDy8izogz_S-OGsB52yI5ISvPYSdkfXwFwy6APoL8X7Jc50T4Tj',
    'client_secret': 'EDhOctw7OuEKhLZ0svWnFYlcnNpTKlDsSJlidZNiFvSzMYGesQpeLLqvKnmie29XO2QrAG11Ga00bEMT'
});


function formatErrors(errors) {
    var formattedErrors = '';

    for (var i in errors) { // eslint-disable-line no-inner-declarations, vars-on-top
        if (errors.hasOwnProperty(i)) {
            formattedErrors += 'Error: ' + errors[i].code + ': ' + errors[i].message + '\n';
        }
    }
    return formattedErrors;
}

function createResultObject(transaction) {
    var result;
    var status = transaction.status;

    if (TRANSACTION_SUCCESS_STATUSES.indexOf(status) !== -1) {
        result = {
            header: 'Sweet Success!',
            icon: 'success',
            message: 'Your test transaction has been successfully processed. See the Braintree API response and try again.'
        };
    } else {
        result = {
            header: 'Transaction Failed',
            icon: 'fail',
            message: 'Your test transaction has a status of ' + status + '. See the Braintree API response and try again.'
        };
    }

    return result;
}

// Load User Model
require('../models/User');
const User = mongoose.model('users');

//paypal
router.get('/booking', (req, res) => {
    res.render('tour/booking');
});

// router.get('/success', (req, res) => {
//     const payerID = req.query.PayerID;
//     const paymentId = req.query.paymentId;

//     var execute_payment_json = {
//         "payer_id": payerID,
//         "transactions": [{
//             "amount": {
//                 "currency": "USD",
//                 "total": "25.00"
//             }
//         }]
//     };
//     paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
//         if (error) {
//             console.log(error.response);
//             throw error;
//         } else {
//             console.log(JSON.stringify(payment));
//             res.send("Success");
//         }
//     });
// });

router.get('/cancel', (req, res) => res.send('Cancelled'));

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

//braintree

router.get('/reserver', (req, res) => {
    gateway.clientToken.generate({}, function (err, response) {
        res.render('tour/reserver', { clientToken: response.clientToken, messages: res.locals.error });
    });

});

router.get('/test/:id', function (req, res) {
    var result;
    var transactionId = req.params.id;

    gateway.transaction.find(transactionId, function (err, transaction) {
        result = createResultObject(transaction);

        // if (!req.body.title) {
        //     errors.push({ text: 'Please add a title' });
        // }
        // if (!req.body.details) {
        //     errors.push({ text: 'Please add some details' });
        // }

        // if (errors.length > 0) {
        //     res.render('ideas/add', {
        //         errors: errors,
        //         title: req.body.title,
        //         details: req.body.detailss
        //     });
        // } else {

        const newBooking = {
            ClientID: user.id,
            TourID: 1,//tour.id,
            Aeroport: booking.aeroport,
            NbrKids: parseInt(booking.enfant),
            NbrAdults: parseInt(booking.adult),
            NbrRooms: booking.chambre,
            Food: booking.nouriture,
            ExtraActivity: booking.activite,
            Message: booking.message,
            IdTrasaction: transaction.id,
            PaymentMethod: transaction.creditCard.cardType,
            BookingDate: moment(Date.now()).format('MM/DD/YYYY'),
            Arrival: booking.arrive,
            Leaving: booking.depart
        }
        new Booking(newBooking)
            .save()
        // req.flash('success_msg', 'Project idea add');
        res.render('tour/success', { transaction: transaction, result: result, booking: booking });

        // }
    });
});
router.post('/test', function (req, res) {
    var transactionErrors;
    var amount = 10;
    //req.body.amount; // In production you should not take amounts directly from clients
    var nonce = req.body.payment_method_nonce;
    var chambre = req.body.arrive;
    gateway.transaction.sale({
        amount: amount,
        paymentMethodNonce: nonce,
        options: {
            submitForSettlement: true
        }
    }, function (err, result) {
        if (result.success || result.transaction) {
            res.redirect('/tour/test/' + result.transaction.id);
        } else {
            transactionErrors = result.errors.deepErrors();
            req.flash('error', formatErrors(transactionErrors));
            res.redirect('/tour/reserver');
        }
    });
});

router.get('/success', (req, res) => {
    res.render('tour/success', { booking: booking });

});

router.get('/testt', function (req, res) {
    booking = req.query.id;
    res.send(booking);
});



module.exports = router;