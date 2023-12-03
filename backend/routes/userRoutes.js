const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to add a new user
router.post('/add', userController.addUser);

// Route to get a user by ID
router.get('/find/:userId', userController.getUserById);

router.put('/updateBalance/:userId', userController.updateBalance);


router.put('/updateBal/:recipientAddress/', userController.updateBalance2);



module.exports = router;
