// controllers/transactionController.js
const Transaction = require('../models/Transaction');
const { execSync } = require('child_process');
const axios = require('axios');
const Block = require('../models/Block');




const sendBitcoin = async (req, res) => {
  const { sender, recipient, amount, gasfees,private_key } = req.body;

//   let yqs = `-----BEGIN PRIVATE KEY-----\n${sender}\n-----END PRIVATE KEY-----`;
//     // publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;

const data = `${sender} ${recipient} ${amount} ${gasfees}`;

try {
 
// signing the transcation
  const response = await axios.post('http://127.0.0.1:5000/sign_data', {
    data,
    private_key,
  });

  const { signature } = response.data;


  // let signature='dfsafdafadfaaaaaaaaadfjsdkfksfjksdjfksdjfl'
const timestamp=Date.now();
try {
  const transaction = new Transaction({
  
    sender,
    recipient,
    amount,
    gasfees,
    timestamp,
    signature
  });

  await transaction.save();


//verifying the transaction

try {
  const response = await axios.post('http://127.0.0.1:5000/verify_signature', { data, signature,sender });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}


// creating a block for tranascation
const difficulty = 5;

  try {
    const response = await axios.post('http://127.0.0.1:5000/create_block', { data, difficulty });
     // Handle Flask API response
     const { index, data: blockData, hash } = response.data;

     // Save the block data to MongoDB
     const newBlock = new Block({
       index,
       data: blockData,
       hash,
     });
     await newBlock.save();
 

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }



  // Update sender's balance logic here

  res.status(201).json(transaction);
  
} catch (error) {
  console.error(error.message);
  res.status(500).json({ error: 'Internal Server Error' });
}




  } catch (error) {
    console.error('Error sending bitcoin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTransactionHistory = async (req, res) => {
  const publicKey = decodeURIComponent(req.params.publicKey);
  const formattedKeyToMatch = publicKey.replace(/[\n\r\s]/g, '');
 

  try {
    // Fetch all transactions
    const allTransactions = await Transaction.find();

    // Filter transactions where either sender or receiver matches the public key
    const filteredTransactions = allTransactions.filter(
      (transaction) => {
        const n1transaction = transaction.recipient.replace(/[\n\r\s]/g, '');
        const n2transaction = transaction.sender.replace(/[\n\r\s]/g, '');
        return n2transaction === formattedKeyToMatch || n1transaction === formattedKeyToMatch;
      }
    );

    res.status(200).json(filteredTransactions);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = { sendBitcoin, getTransactionHistory };
