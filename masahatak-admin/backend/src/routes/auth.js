const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/profile
// @desc    Get current admin profile
// @access  Private
router.get('/profile', authMiddleware, authController.getProfile);

// @route   PUT /api/auth/profile
// @desc    Update current admin profile
// @access  Private
router.put('/profile', authMiddleware, authController.updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change admin password
// @access  Private
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
