const { query } = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const result = await query('SELECT * FROM products ORDER BY id ASC');
        const products = result.rows.map(p => ({
            id: p.id.toString(),
            name: p.name,
            category: p.category,
            price: parseFloat(p.price),
            description: p.description,
            image: p.image_url,
            // These fields are not in DB yet, keeping defaults or using DB if added
            stock: 100,
            rating: 4.5,
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
    const { name, category, price, description } = req.body;
    let image_url = req.body.image_url; // Default if provided as string

    // If a file was uploaded by multer
    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        const result = await query(
            'INSERT INTO products (name, category, price, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, category, price, description, image_url]
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
    const { name, category, price, description } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        let updateQuery = 'UPDATE products SET name = $1, category = $2, price = $3, description = $4';
        let params = [name, category, price, description, id];

        if (image_url) {
            updateQuery += ', image_url = $5 WHERE id = $6';
            params = [name, category, price, description, image_url, id];
        } else {
            updateQuery += ' WHERE id = $5';
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
        const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Server error deleting product' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
