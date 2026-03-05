const { query } = require('../config/db');

const getAllCoupons = async (req, res) => {
    try {
        const result = await query('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching coupons:', err);
        res.status(500).json({ message: 'Server error fetching coupons', error: err.message });
    }
};

const createCoupon = async (req, res) => {
    const {
        code, discount_type, discount_value, min_purchase_amount,
        usage_limit, start_date, end_date, is_active
    } = req.body;

    try {
        const result = await query(
            `INSERT INTO coupons (
                code, discount_type, discount_value, min_purchase_amount,
                usage_limit, start_date, end_date, is_active
            ) VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP), $7, COALESCE($8, TRUE))
            RETURNING *`,
            [code, discount_type, discount_value, min_purchase_amount, usage_limit, start_date, end_date, is_active]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating coupon:', err);
        res.status(500).json({ message: 'Server error creating coupon', error: err.message });
    }
};

const updateCoupon = async (req, res) => {
    const { id } = req.params;
    const {
        code, discount_type, discount_value, min_purchase_amount,
        usage_limit, start_date, end_date, is_active
    } = req.body;

    try {
        const result = await query(
            `UPDATE coupons SET
                code = $1, discount_type = $2, discount_value = $3, min_purchase_amount = $4,
                usage_limit = $5, start_date = $6, end_date = $7, is_active = $8
            WHERE id = $9 RETURNING *`,
            [code, discount_type, discount_value, min_purchase_amount, usage_limit, start_date, end_date, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating coupon:', err);
        res.status(500).json({ message: 'Server error updating coupon', error: err.message });
    }
};

const deleteCoupon = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM coupons WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json({ message: 'Coupon deleted successfully' });
    } catch (err) {
        console.error('Error deleting coupon:', err);
        res.status(500).json({ message: 'Server error deleting coupon', error: err.message });
    }
};

const validateCoupon = async (req, res) => {
    const { code, cartSubtotal } = req.body;

    try {
        const result = await query('SELECT * FROM coupons WHERE code = $1', [code]);
        if (result.rows.length === 0) {
            return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
        }

        const coupon = result.rows[0];

        if (!coupon.is_active) {
            return res.status(400).json({ valid: false, message: 'Coupon is not active' });
        }

        const now = new Date();
        if (coupon.start_date && new Date(coupon.start_date) > now) {
            return res.status(400).json({ valid: false, message: 'Coupon is not yet valid' });
        }

        if (coupon.end_date && new Date(coupon.end_date) < now) {
            return res.status(400).json({ valid: false, message: 'Coupon has expired' });
        }

        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return res.status(400).json({ valid: false, message: 'Coupon usage limit reached' });
        }

        if (cartSubtotal < Number(coupon.min_purchase_amount)) {
            return res.status(400).json({ valid: false, message: `Minimum purchase amount of $${coupon.min_purchase_amount} required` });
        }

        let discountAmount = 0;
        if (coupon.discount_type === 'percentage') {
            discountAmount = cartSubtotal * (Number(coupon.discount_value) / 100);
        } else if (coupon.discount_type === 'fixed') {
            discountAmount = Number(coupon.discount_value);
        }

        // Ensure discount doesn't exceed subtotal
        discountAmount = Math.min(discountAmount, cartSubtotal);

        res.json({
            valid: true,
            coupon_id: coupon.id,
            discount_amount: discountAmount.toFixed(2),
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value
        });

    } catch (err) {
        console.error('Error validating coupon:', err);
        res.status(500).json({ message: 'Server error validating coupon', error: err.message });
    }
};

module.exports = {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
};
