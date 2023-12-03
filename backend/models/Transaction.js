const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  amount: { type: Number, required: true },
  gasfees: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  signature: { type: String, required: true },
  
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;


