const User = require('../models/User');
const { execSync } = require('child_process');
const axios = require('axios');


// Controller function to add a new user
const addUser = async (req, res) => {
  try {
    const { email, password } = req.body;


    try {
      const response = await axios.get('http://127.0.0.1:5000/generate_keys');
      const { private_key, public_key } = response.data;

      // Create a new user instance
    const newUser = new User({
      email,
      password,
      privateKey: private_key,
      publicKey: public_key,
    });

    //Save the user to the database
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
     
    } catch (error) {
      console.error("Error making request:", error.message);
  console.error("Response data:", error.response ? error.response.data : null);
  console.error("Response status:", error.response ? error.response.status : null);
      res.status(500).json({ error: 'Internal Server Error' });
    }


  //  privateKey = privateKey.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").trim();
  //  publicKey=publicKey.replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", "").trim();

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function to get a user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by ID in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const  updateBalance = async (req, res) => {
    try {
      const userId = req.params.userId;
      const { newBalance } = req.body;

      // Validate if newBalance is a number (you can add more validation as needed)
      if (isNaN(newBalance)) {
        return res.status(400).json({ error: 'Invalid balance value' });
      }

      // Find the user by userId and update the balance
      const user = await User.findByIdAndUpdate(userId, { balance: newBalance }, { new: true });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ message: 'Balance updated successfully sender', user });
    } catch (error) {
      console.error('Error updating balance:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  const updateBalance2 = async (req, res) => {
    try {
      let publicKey = decodeURIComponent(req.params.recipientAddress);
      // publicKey = publicKey.replace(/\s+/g, '');
      const { upbalanc } = req.body;
  
      // Validate if newBalance is a number (you can add more validation as needed)
      if (isNaN(upbalanc)) {
        return res.status(400).json({ error: 'Invalid balance value' });
      }
  

  const storedUsers = await User.find();
 
   // Remove line breaks and spaces from the public key
const formattedKeyToMatch = publicKey.replace(/[\n\r\s]/g, '');

const matchingUser = storedUsers.find(user => {
  const storedKeyWithoutSpaces = user.publicKey.replace(/[\n\r\s]/g, '');
  return storedKeyWithoutSpaces === formattedKeyToMatch;
});
   
      if (!matchingUser) {
         return res.status(404).json({ error: 'User not found' });
        console.log("user not found") 
      }
  
      matchingUser.balance += upbalanc;
  
      // Save the updated user object
      await matchingUser.save();
  
      return res.status(200).json({ message: 'Balance updated successfully recipient', matchingUser });
    } catch (error) {
      console.error('Error updating balance:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  


module.exports = {
  addUser,
  getUserById,
  updateBalance,
  updateBalance2
};
