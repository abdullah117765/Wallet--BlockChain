// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Endpoint for sending bitcoin
router.post('/sendBitcoin', transactionController.sendBitcoin);

// Endpoint for fetching transaction history
router.get('/get/:publicKey', transactionController.getTransactionHistory);

module.exports = router;
