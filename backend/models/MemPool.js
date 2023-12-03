const mongoose = require('mongoose');
const mempoolSchema = new mongoose.Schema({
  // Array of transactions in the mempool
  transactions: [transactionSchema],
});

// Create the Mongoose model for the mempool
const Mempool = mongoose.model('Mempool', mempoolSchema);

module.exports = Mempool;