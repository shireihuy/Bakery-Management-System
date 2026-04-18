const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Get message history with another user (Authenticated users)
router.get('/history/:otherUserId', authenticateToken, chatController.getMessageHistory);

// Get list of conversations (Admin and Manager only)
router.get('/conversations', authenticateToken, authorizeRoles('Admin', 'Manager'), chatController.getConversations);

module.exports = router;
