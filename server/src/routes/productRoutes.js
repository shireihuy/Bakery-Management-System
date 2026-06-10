const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const batchController = require('../controllers/batchController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Multer storage configuration with Cloudinary
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'bakery-products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
});

const upload = multer({ storage: storage });

const handleUpload = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Product image upload failed:', err);
            return res.status(400).json({ message: err.message || 'Image upload failed' });
        }
        next();
    });
};

// Public route to get all products
router.get('/', productController.getProducts);
router.get('/tags', productController.getTags);
router.get('/:id', productController.getProductById);

// Protected routes for management (Admin, Manager, Cashier)
router.post('/', authenticateToken, authorizeRoles('Admin', 'Manager', 'Cashier'), handleUpload, productController.createProduct);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Manager', 'Cashier'), handleUpload, productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('Admin', 'Manager', 'Cashier'), productController.deleteProduct);

// Inventory stock (legacy — kept for compatibility, still works via batch sync)
router.patch('/:id/stock', authenticateToken, authorizeRoles('Admin', 'Manager', 'Cashier'), productController.updateStock);

// Batch routes (Admin, Manager, Baker, Cashier)
router.get('/:id/batches', authenticateToken, authorizeRoles('Admin', 'Manager', 'Cashier'), batchController.getBatches);
router.post('/:id/batches', authenticateToken, authorizeRoles('Admin', 'Manager', 'Cashier'), batchController.addBatch);
router.delete('/:id/batches/:batchId', authenticateToken, authorizeRoles('Admin', 'Manager'), batchController.deleteBatch);

// Rating routes
router.post('/:id/rate', authenticateToken, productController.submitRating);
router.delete('/:id/ratings', authenticateToken, authorizeRoles('Admin'), productController.resetRatings);

module.exports = router;
