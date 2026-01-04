const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All order routes require authentication
router.use(authenticateToken);

// Create a new order
router.post('/', orderController.createOrder);

// Get all orders (Admin, Manager, Baker, Cashier)
router.get('/', authorizeRoles('Admin', 'Manager', 'Baker', 'Cashier'), orderController.getOrders);

// Get current user's orders
router.get('/my-orders', orderController.getMyOrders);

// Update order status (Staff only)
router.put('/:id/status', authorizeRoles('Admin', 'Manager', 'Baker', 'Cashier'), orderController.updateOrderStatus);

module.exports = router;
