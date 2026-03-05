const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// All payment routes require authentication (or guest token if implemented)
router.use(authenticateToken);

// Initiate a payment session
router.post('/initiate', paymentController.initiatePayment);

// Verify payment status
router.get('/verify/:orderId', paymentController.verifyPayment);

// Callback simulation (In a real app, this would be a public endpoint called by MoMo/ZaloPay)
router.post('/simulate-callback', paymentController.simulateCallback);

module.exports = router;
