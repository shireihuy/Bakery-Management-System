const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
// const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Validating coupon from customer side
router.post('/validate', couponController.validateCoupon);

// Admin / Manager routes
// We typically would add verifyToken and verifyRole middleware here
// e.g. router.use(verifyToken);
// router.get('/', verifyRole(['Admin', 'Manager']), couponController.getAllCoupons);
router.get('/', couponController.getAllCoupons);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
