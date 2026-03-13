const { query } = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const result = await query('SELECT * FROM products WHERE is_active = TRUE ORDER BY id ASC');
        const products = result.rows.map(p => ({
            id: p.id.toString(),
            name: p.name,
            category: p.category,
            price: parseFloat(p.price),
            description: p.description,
            image: p.image_url,
            is_active: p.is_active,
            stock: parseFloat(p.stock_quantity || 0),
            min_stock: parseFloat(p.min_stock_level || 5),
            unit: p.unit || 'pcs',
            last_restocked: p.last_restocked,
            rating: 4.5, // Keep mock rating for now
        }));
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ message: 'Server error fetching product' });
    }
};

const createProduct = async (req, res) => {
    console.log('Create Product Request Body:', req.body);
    console.log('Create Product Request File:', req.file);
    const { name, category, price, description, stock_quantity, min_stock_level, unit } = req.body;
    let image_url = req.body.image_url; // Default if provided as string

    // If a file was uploaded by multer
    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        const result = await query(
            'INSERT INTO products (name, category, price, description, image_url, stock_quantity, min_stock_level, unit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, category, price, description, image_url, stock_quantity || 0, min_stock_level || 5, unit || 'pcs']
        );
        console.log('Product created successfully:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: 'Server error creating product', error: err.message });
    }
};

const updateProduct = async (req, res) => {
    console.log('Update Product Request Body:', req.body);
    console.log('Update Product Request File:', req.file);
    const { id } = req.params;
    const { name, category, price, description, stock_quantity, min_stock_level, unit } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        let updateQuery = 'UPDATE products SET name = $1, category = $2, price = $3, description = $4, stock_quantity = $5, min_stock_level = $6, unit = $7';
        let params = [name, category, price, description, stock_quantity, min_stock_level, unit, id];

        if (image_url) {
            updateQuery += ', image_url = $8 WHERE id = $9';
            params = [name, category, price, description, stock_quantity, min_stock_level, unit, image_url, id];
        } else {
            updateQuery += ' WHERE id = $8';
        }

        const result = await query(updateQuery + ' RETURNING *', params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.log('Product updated successfully:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Server error updating product', error: err.message });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        // Soft delete: update is_active instead of actual deletion
        const result = await query('UPDATE products SET is_active = FALSE WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted from menu successfully (Soft Delete)' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Server error deleting product' });
    }
};

const updateStock = async (req, res) => {
    const { id } = req.params;
    const { quantity, reset } = req.body; // If reset is true, it sets the stock, else it adds to it.

    try {
        let updateQuery;
        let params;

        if (reset) {
            updateQuery = 'UPDATE products SET stock_quantity = $1, last_restocked = CURRENT_TIMESTAMP';
            params = [quantity];
            
            if (req.body.minQuantity !== undefined) {
                updateQuery += ', min_stock_level = $2';
                params.push(req.body.minQuantity);
            }
            
            updateQuery += ' WHERE id = $' + (params.length + 1) + ' RETURNING *';
            params.push(id);
        } else {
            updateQuery = 'UPDATE products SET stock_quantity = stock_quantity + $1, last_restocked = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
            params = [quantity, id];
        }

        const result = await query(updateQuery, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log(`Stock updated for product ${id}: ${result.rows[0].stock_quantity}`);

        // Emit real-time update
        if (global.io) {
            global.io.emit('stock:updated', {
                productId: id,
                newStock: result.rows[0].stock_quantity
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating stock:', err);
        res.status(500).json({ message: 'Server error updating stock' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock
};
