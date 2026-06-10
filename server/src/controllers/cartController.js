const pool = require('../config/db');
const { resolveImageUrl } = require('../utils/imageUrl');

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT 
                ci.id as cart_item_id,
                ci.product_id,
                ci.quantity,
                p.name,
                p.price,
                p.stock_quantity as stock,
                p.image_url as image,
                p.category,
                fsi.sale_price as flash_sale_price,
                fsi.flash_sale_stock,
                fsi.sold_quantity as flash_sale_sold,
                fsi.end_time as flash_sale_end
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            LEFT JOIN (
                SELECT i.*, s.end_time
                FROM flash_sale_items i
                JOIN flash_sales s ON i.flash_sale_id = s.id
                WHERE s.is_active = TRUE 
                  AND s.start_time <= CURRENT_TIMESTAMP 
                  AND s.end_time >= CURRENT_TIMESTAMP
            ) fsi ON p.id = fsi.product_id
            WHERE ci.user_id = $1
            ORDER BY ci.created_at ASC
        `, [userId]);
        
        // Map to expected CartItem format
        const items = result.rows.map(row => ({
            id: row.product_id.toString(),
            cartItemId: row.cart_item_id,
            name: row.name,
            price: Number(row.price),
            stock: Number(row.stock),
            image: resolveImageUrl(row.image),
            category: row.category,
            quantity: row.quantity,
            flashSale: row.flash_sale_price ? {
                salePrice: parseFloat(row.flash_sale_price),
                stock: row.flash_sale_stock,
                sold: row.flash_sale_sold,
                endTime: row.flash_sale_end
            } : null
        }));
        
        res.json({ success: true, cart: items });

    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        
        if (!productId || quantity === undefined) {
            return res.status(400).json({ success: false, message: 'Product ID and quantity required' });
        }
        
        if (quantity <= 0) {
            await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);
        } else {
            await pool.query(`
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, product_id)
                DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP
            `, [userId, productId, quantity]);
        }
        
        res.json({ success: true, message: 'Cart updated' });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        
        await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);
        res.json({ success: true, message: 'Item removed' });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
