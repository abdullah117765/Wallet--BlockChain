// mempoolRoutes.js
const express = require('express');
const router = express.Router();
const mempoolController = require('../controllers/mempoolController');

// Create a new transaction in the mempool
router.post('/transaction', mempoolController.createTransactionInMempool);

// Get all transactions in the mempool
router.get('/transactions', mempoolController.getAllTransactionsInMempool);

// Remove all transactions from the mempool
router.delete('/transactions', mempoolController.removeAllTransactionsFromMempool);


// Select transactions from the mempool based on higher gas prices
router.get('/selectTransactions/:blockSize', mempoolController.selectTransactionsByGasPrice);


module.exports = router;
