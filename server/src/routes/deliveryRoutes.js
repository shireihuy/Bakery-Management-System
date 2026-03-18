const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Define API endpoints for deliveries:
// 1. Get delivery info for a specific order (customer-facing)
router.get('/orders/:orderId', deliveryController.getDeliveryByOrderId);

// 2. Request a delivery for an order (admin-facing)
router.post('/orders/:orderId/request', deliveryController.requestDelivery);

module.exports = router;
