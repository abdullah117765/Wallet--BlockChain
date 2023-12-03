const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();
const bodyParser = require('body-parser');
const User = require('./models/User');



const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();
const port = process.env.PORT || 3001;
const dbURI = process.env.ATLAS_URI;
const secretKey= process.env.SECRET_KEY;



mongoose.connect(dbURI)
  .then(() => {
    console.log("Connected to database");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });    

app.use(cors());
app.use(express.json());
// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





const jwt = require('jsonwebtoken');

app.post ('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    // Verify user credentials
  if (user) {
    // Create a JWT with user information
    const token = jwt.sign({ email }, secretKey);

    // Include the token in the JSON response
res.status(200).json({
  user: user,
  token: token,
});
  } else {
    // Return an error if credentials are invalid
    res.status(401).json({ error: 'Invalid credentials' });
  }  
  } catch (error) {
    res.status(401).json({ error: error.message });
  }

  
});



// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token Required' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // req.user = user;
    next();
  });
};
  

  app.get('/', (req, res) => {
 res.send("welcome")
  });


  app.use('/transactions',authenticateToken , transactionRoutes);
  app.use('/users' , userRoutes);