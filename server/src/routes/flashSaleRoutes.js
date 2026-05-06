const express = require('express');
const router = express.Router();
const flashSaleController = require('../controllers/flashSaleController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');


// Get active sales for everyone (customers/public)
router.get('/active', flashSaleController.getActiveFlashSales);

// Admin-only routes for management
router.get('/', authenticateToken, authorizeRoles('Admin', 'Manager'), flashSaleController.getFlashSales);
router.post('/', authenticateToken, authorizeRoles('Admin', 'Manager'), flashSaleController.createFlashSale);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), flashSaleController.updateFlashSale);
router.patch('/:id/toggle', authenticateToken, authorizeRoles('Admin', 'Manager'), flashSaleController.toggleFlashSale);
router.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), flashSaleController.deleteFlashSale);


module.exports = router;
