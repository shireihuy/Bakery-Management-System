const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticateToken);

// Initiate a payment session
router.post('/initiate', paymentController.initiatePayment);

// Verify payment status
router.get('/verify/:orderId', paymentController.verifyPayment);

// Callback simulation
router.post('/simulate-callback', paymentController.simulateCallback);

// Payment Settings
router.get('/settings', paymentController.getPaymentSettings);
router.post('/settings', authorizeRoles('Admin', 'Manager'), paymentController.updatePaymentSettings);

module.exports = router;
