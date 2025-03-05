const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// Protected routes - require authentication
router.use(auth);

// Get user profile
router.get('/profile', userController.getUserProfile);

// Update user profile
router.put('/profile', userController.updateUserProfile);

// Change password
router.put('/password', userController.changePassword);

// Delete user account
router.delete('/account', userController.deleteAccount);

module.exports = router; 