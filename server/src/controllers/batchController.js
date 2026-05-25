const { query } = require('../config/db');
const NotificationController = require('./notificationController');

// Helper: recalculate and sync stock_quantity on the products table
const syncProductStock = async (productId) => {
    await query(`
        UPDATE products
        SET stock_quantity = (
            SELECT COALESCE(SUM(quantity), 0)
            FROM product_batches
            WHERE product_id = $1
        ),
        last_restocked = CURRENT_TIMESTAMP
        WHERE id = $1
    `, [productId]);
};

// GET /products/:id/batches
const getBatches = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query(`
            SELECT id, product_id, quantity, expiration_date, received_at, notes
            FROM product_batches
            WHERE product_id = $1
            ORDER BY
                CASE WHEN expiration_date IS NULL THEN 1 ELSE 0 END,
                expiration_date ASC,
                received_at ASC
        `, [id]);

        const batches = result.rows.map(b => ({
            id: b.id,
            productId: b.product_id,
            quantity: parseFloat(b.quantity),
            expirationDate: b.expiration_date,
            receivedAt: b.received_at,
            notes: b.notes
        }));
        res.json(batches);
    } catch (err) {
        console.error('Error fetching batches:', err);
        res.status(500).json({ message: 'Server error fetching batches' });
    }
};

// POST /products/:id/batches
const addBatch = async (req, res) => {
    const { id: productId } = req.params;
    const { quantity, expirationDate, notes } = req.body;

    if (!quantity || parseFloat(quantity) <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    try {
        // Verify product exists
        const productCheck = await query('SELECT id, name, min_stock_level FROM products WHERE id = $1 AND is_active = TRUE', [productId]);
        if (productCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const finalExpiry = (expirationDate && expirationDate.toString().trim() !== '') ? expirationDate : null;

        const result = await query(`
            INSERT INTO product_batches (product_id, quantity, expiration_date, notes)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [productId, parseFloat(quantity), finalExpiry, notes || null]);

        // Sync the product's cached stock_quantity
        await syncProductStock(productId);

        // Fetch updated product for low-stock check
        const updated = await query('SELECT stock_quantity, min_stock_level, name FROM products WHERE id = $1', [productId]);
        const product = updated.rows[0];
        if (product.stock_quantity <= product.min_stock_level) {
            await NotificationController.notifyAdmins(
                'Low Stock Alert',
                `Product "${product.name}" is low on stock (${product.stock_quantity} left).`,
                'warning'
            );
        }

        // Emit real-time update
        if (global.io) {
            global.io.emit('stock:updated', { productId, newStock: product.stock_quantity });
        }

        const batch = result.rows[0];
        res.status(201).json({
            id: batch.id,
            productId: batch.product_id,
            quantity: parseFloat(batch.quantity),
            expirationDate: batch.expiration_date,
            receivedAt: batch.received_at,
            notes: batch.notes
        });
    } catch (err) {
        console.error('Error adding batch:', err);
        res.status(500).json({ message: 'Server error adding batch', error: err.message });
    }
};

// DELETE /products/:id/batches/:batchId
const deleteBatch = async (req, res) => {
    const { id: productId, batchId } = req.params;
    try {
        const result = await query(
            'DELETE FROM product_batches WHERE id = $1 AND product_id = $2 RETURNING *',
            [batchId, productId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        // Sync cached stock
        await syncProductStock(productId);

        if (global.io) {
            const updated = await query('SELECT stock_quantity FROM products WHERE id = $1', [productId]);
            global.io.emit('stock:updated', { productId, newStock: updated.rows[0]?.stock_quantity });
        }

        res.json({ message: 'Batch deleted successfully' });
    } catch (err) {
        console.error('Error deleting batch:', err);
        res.status(500).json({ message: 'Server error deleting batch' });
    }
};

module.exports = { getBatches, addBatch, deleteBatch };
