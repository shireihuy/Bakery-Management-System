const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes (e.g. for fetching currency rates)
router.get('/settings', paymentController.getPaymentSettings);

// Webhook for PayOS (Note: No authentication because PayOS verifies signatures)
router.post('/payos-webhook', paymentController.handlePayOSWebhook);

// All other payment routes require authentication
router.use(authenticateToken);

// Initiate a payment session
router.post('/initiate', paymentController.initiatePayment);

// Verify payment status
router.get('/verify/:orderId', paymentController.verifyPayment);

// Callback simulation
router.post('/simulate-callback', paymentController.simulateCallback);

// Update Payment Settings (Admin/Manager only)
router.post('/settings', authorizeRoles('Admin', 'Manager'), paymentController.updatePaymentSettings);

module.exports = router;
