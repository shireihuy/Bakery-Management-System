const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public route to get all products
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
