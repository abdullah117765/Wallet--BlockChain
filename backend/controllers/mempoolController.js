// mempoolController.js
const Mempool = require('../models/MemPool');

// Create a new transaction in the mempool
exports.createTransactionInMempool = async (req, res) => {
  try {
    const { sender, recipient, amount, gasfees, signature } = req.body;

    const newTransaction = {
      sender,
      recipient,
      amount,
      gasfees,
      signature,
    };

    const mempool = await Mempool.findOne();
    mempool.transactions.push(newTransaction);
    await mempool.save();

    res.json({ message: 'Transaction added to mempool successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all transactions in the mempool
exports.getAllTransactionsInMempool = async (req, res) => {
  try {
    const mempool = await Mempool.findOne();
    res.json(mempool.transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Remove all transactions from the mempool
exports.removeAllTransactionsFromMempool = async (req, res) => {
  try {
    const mempool = await Mempool.findOne();
    mempool.transactions = [];
    await mempool.save();
    
    res.json({ message: 'All transactions removed from mempool successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Select transactions from the mempool based on higher gas prices
exports.selectTransactionsByGasPrice = async (req, res) => {
    try {
      const blockSize = req.params.blockSize; // You might pass the block size as a parameter
  
      const mempool = await Mempool.findOne();
      const sortedTransactions = mempool.transactions.sort((a, b) => b.gasfees - a.gasfees);
  
      let currentBlockSize = 0;
      const selectedTransactions = [];
  
      for (const transaction of sortedTransactions) {
        const transactionSize = calculateTransactionSize(transaction); // Implement this function based on your requirements
  
        // Check if adding the transaction exceeds the block size limit
        if (currentBlockSize + transactionSize <= blockSize) {
          selectedTransactions.push(transaction);
          currentBlockSize += transactionSize;
        } else {
          break; // Stop if the block is full
        }
      }
  
      // Remove selected transactions from the mempool
      mempool.transactions = mempool.transactions.filter(
        (transaction) => !selectedTransactions.includes(transaction)
      );
  
      await mempool.save();
  
      res.json(selectedTransactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };