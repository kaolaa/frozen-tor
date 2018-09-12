'use strict';

var braintree = require('braintree');

// var environment, gateway;

// require('dotenv').load();
// environment = process.env.BT_ENVIRONMENT.charAt(0).toUpperCase() + process.env.BT_ENVIRONMENT.slice(1);
var gateway = braintree.connect({

  environment : braintree.Environment.Sandbox,
  merchantId  : "vgmqwkcfd4vcf629",
  publicKey   : "3mpjk6fs8zhnr4xz",
  privateKey  : "1a74937025502a982d3277af40782bfc"
});
// gateway = braintree.connect({
//   environment: braintree.Environment[environment],
//   merchantId: process.env.BT_MERCHANT_ID,
//   publicKey: process.env.BT_PUBLIC_KEY,
//   privateKey: process.env.BT_PRIVATE_KEY
// });

module.exports = gateway;
