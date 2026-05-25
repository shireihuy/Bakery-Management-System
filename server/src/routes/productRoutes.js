const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const batchController = require('../controllers/batchController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Public route to get all products
router.get('/', productController.getProducts);
router.get('/tags', productController.getTags);
router.get('/:id', productController.getProductById);

// Protected routes for management (Admin, Manager, Cashier)
router.post('/', authenticateToken, authorizeRoles('Admin', 'Manager', 'Cashier'), upload.single('image'), productController.createProduct);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Manager', 'Cashier'), upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Manager', 'Cashier'), productController.deleteProduct);

// Inventory stock (legacy — kept for compatibility, still works via batch sync)
router.patch('/:id/stock', authenticateToken, authorizeRoles('Admin', 'Manager', 'Baker', 'Cashier'), productController.updateStock);

// Batch routes (Admin, Manager, Baker, Cashier)
router.get('/:id/batches', authenticateToken, authorizeRoles('Admin', 'Manager', 'Baker', 'Cashier'), batchController.getBatches);
router.post('/:id/batches', authenticateToken, authorizeRoles('Admin', 'Manager', 'Baker', 'Cashier'), batchController.addBatch);
router.delete('/:id/batches/:batchId', authenticateToken, authorizeRoles('Admin', 'Manager'), batchController.deleteBatch);

// Rating routes
router.post('/:id/rate', authenticateToken, productController.submitRating);
router.delete('/:id/ratings', authenticateToken, authorizeRoles('Admin'), productController.resetRatings);

module.exports = router;
