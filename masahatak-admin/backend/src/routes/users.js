const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/users
// @desc    Get all users with pagination
// @access  Private (Admin)
router.get('/', usersController.getAllUsers);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin)
router.post('/', usersController.createUser);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin)
router.get('/:id', usersController.getUserById);

// @route   PUT /api/users/:id/status
// @desc    Update user status
// @access  Private (Admin)
router.put('/:id/status', usersController.updateUserStatus);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/:id', usersController.deleteUser);

module.exports = router;
