const { query, pool } = require('../config/db');

const getFlashSales = async (req, res) => {
    try {
        const result = await query(`
            SELECT fs.*, 
                   COALESCE(json_agg(json_build_object(
                       'id', fsi.id,
                       'product_id', fsi.product_id,
                       'sale_price', fsi.sale_price,
                       'flash_sale_stock', fsi.flash_sale_stock,
                       'sold_quantity', fsi.sold_quantity,
                       'name', p.name,
                       'image', p.image_url,
                       'original_price', p.price
                   )) FILTER (WHERE fsi.id IS NOT NULL), '[]') as items
            FROM flash_sales fs
            LEFT JOIN flash_sale_items fsi ON fs.id = fsi.flash_sale_id
            LEFT JOIN products p ON fsi.product_id = p.id
            GROUP BY fs.id
            ORDER BY fs.start_time DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching flash sales:', err);
        res.status(500).json({ message: 'Server error fetching flash sales' });
    }
};

const getActiveFlashSales = async (req, res) => {
    try {
        const result = await query(`
            SELECT fs.*, 
                   COALESCE(json_agg(json_build_object(
                       'id', fsi.id,
                       'product_id', fsi.product_id,
                       'sale_price', fsi.sale_price,
                       'flash_sale_stock', fsi.flash_sale_stock,
                       'sold_quantity', fsi.sold_quantity,
                       'name', p.name,
                       'image', p.image_url,
                       'original_price', p.price
                   )) FILTER (WHERE fsi.id IS NOT NULL), '[]') as items
            FROM flash_sales fs
            LEFT JOIN flash_sale_items fsi ON fs.id = fsi.flash_sale_id
            LEFT JOIN products p ON fsi.product_id = p.id
            WHERE fs.is_active = TRUE 
              AND fs.start_time <= CURRENT_TIMESTAMP 
              AND fs.end_time >= CURRENT_TIMESTAMP
            GROUP BY fs.id
            ORDER BY fs.start_time ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching active flash sales:', err);
        res.status(500).json({ message: 'Server error fetching active flash sales' });
    }
};

const createFlashSale = async (req, res) => {
    const { name, start_time, end_time, items } = req.body;
    
    if (new Date(end_time) <= new Date(start_time)) {
        return res.status(400).json({ message: 'End time must be after start time' });
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        for (const item of items) {
            const conflict = await client.query(`
                SELECT fs.name 
                FROM flash_sales fs
                JOIN flash_sale_items fsi ON fs.id = fsi.flash_sale_id
                WHERE fsi.product_id = $1
                AND (
                    (fs.start_time <= $2 AND fs.end_time >= $2) OR
                    (fs.start_time <= $3 AND fs.end_time >= $3) OR
                    (fs.start_time >= $2 AND fs.end_time <= $3)
                ) AND fs.is_active = TRUE
            `, [item.product_id, start_time, end_time]);

            if (conflict.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ 
                    message: `Product ${item.product_id} is already in another active sale: ${conflict.rows[0].name}` 
                });
            }
        }

        const saleResult = await client.query(
            'INSERT INTO flash_sales (name, start_time, end_time) VALUES ($1, $2, $3) RETURNING *',
            [name, start_time, end_time]
        );
        
        const flashSaleId = saleResult.rows[0].id;

        for (const item of items) {
            await client.query(
                'INSERT INTO flash_sale_items (flash_sale_id, product_id, sale_price, flash_sale_stock) VALUES ($1, $2, $3, $4)',
                [flashSaleId, item.product_id, item.sale_price, item.flash_sale_stock]
            );
        }

        await client.query('COMMIT');

        // Emit socket update
        if (global.io) {
            global.io.emit('flash_sale:created', saleResult.rows[0]);
        }

        res.status(201).json(saleResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating flash sale:', err);
        res.status(500).json({ message: 'Server error creating flash sale', error: err.message });
    } finally {
        client.release();
    }
};


const toggleFlashSale = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    
    try {
        const result = await query(
            'UPDATE flash_sales SET is_active = $1 WHERE id = $2 RETURNING *',
            [is_active, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Flash sale not found' });
        }

        if (global.io) {
            global.io.emit('flash_sale:updated', result.rows[0]);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error toggling flash sale:', err);
        res.status(500).json({ message: 'Server error toggling flash sale' });
    }
};

const updateFlashSale = async (req, res) => {
    const { id } = req.params;
    const { name, start_time, end_time, items, is_active } = req.body;
    
    if (start_time !== undefined && end_time !== undefined) {
        if (new Date(end_time) <= new Date(start_time)) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Update the main sale record
        let updateFields = [];
        let params = [];
        let paramCount = 1;

        if (name !== undefined) { updateFields.push(`name = $${paramCount++}`); params.push(name); }
        if (start_time !== undefined) { updateFields.push(`start_time = $${paramCount++}`); params.push(start_time); }
        if (end_time !== undefined) { updateFields.push(`end_time = $${paramCount++}`); params.push(end_time); }
        if (is_active !== undefined) { updateFields.push(`is_active = $${paramCount++}`); params.push(is_active); }

        if (updateFields.length > 0) {
            params.push(id);
            await client.query(`UPDATE flash_sales SET ${updateFields.join(', ')} WHERE id = $${paramCount}`, params);
        }

        // 2. If items are provided, update/replace them
        if (items && Array.isArray(items)) {
            // Delete existing items and re-insert (simplest way to handle updates/removals)
            await client.query('DELETE FROM flash_sale_items WHERE flash_sale_id = $1', [id]);
            
            for (const item of items) {
                await client.query(
                    'INSERT INTO flash_sale_items (flash_sale_id, product_id, sale_price, flash_sale_stock, sold_quantity) VALUES ($1, $2, $3, $4, $5)',
                    [id, item.product_id, item.sale_price, item.flash_sale_stock, item.sold_quantity || 0]
                );
            }
        }

        await client.query('COMMIT');

        // Fetch updated sale
        const updatedResult = await client.query(`
            SELECT fs.*, 
                   COALESCE(json_agg(json_build_object(
                       'id', fsi.id,
                       'product_id', fsi.product_id,
                       'sale_price', fsi.sale_price,
                       'flash_sale_stock', fsi.flash_sale_stock,
                       'sold_quantity', fsi.sold_quantity
                   )) FILTER (WHERE fsi.id IS NOT NULL), '[]') as items
            FROM flash_sales fs
            LEFT JOIN flash_sale_items fsi ON fs.id = fsi.flash_sale_id
            WHERE fs.id = $1
            GROUP BY fs.id
        `, [id]);

        if (global.io) {
            global.io.emit('flash_sale:updated', updatedResult.rows[0]);
        }

        res.json(updatedResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating flash sale:', err);
        res.status(500).json({ message: 'Server error updating flash sale', error: err.message });
    } finally {
        client.release();
    }
};

const deleteFlashSale = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM flash_sales WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Flash sale not found' });
        }
        res.json({ message: 'Flash sale deleted successfully' });
    } catch (err) {
        console.error('Error deleting flash sale:', err);
        res.status(500).json({ message: 'Server error deleting flash sale' });
    }
};

module.exports = {
    getFlashSales,
    getActiveFlashSales,
    createFlashSale,
    toggleFlashSale,
    updateFlashSale,
    deleteFlashSale
};
