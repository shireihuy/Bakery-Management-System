const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All order routes require authentication
router.use(authenticateToken);

// Create a new order
router.post('/', orderController.createOrder);

// Get all orders (Admin, Manager, Cashier)
router.get('/', authorizeRoles('Admin', 'Manager', 'Cashier'), orderController.getOrders);

// Get current user's orders
router.get('/my-orders', orderController.getMyOrders);

// Get a single order (For payment/summary)
router.get('/:id', orderController.getOrderById);

// Update order status (Staff to update process, Customers can only cancel)
router.put('/:id/status', authorizeRoles('Admin', 'Manager', 'Cashier', 'Customer'), orderController.updateOrderStatus);

module.exports = router;
