const { query } = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const result = await query('SELECT * FROM products ORDER BY id ASC');
        // Map database fields to frontend fields
        const products = result.rows.map(p => ({
            id: p.id.toString(),
            name: p.name,
            category: p.category,
            price: parseFloat(p.price),
            description: p.description,
            image: p.image_url,
            stock: 100, // DB doesn't have stock yet, using default
            rating: 4.5, // DB doesn't have rating yet, using default
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

module.exports = {
    getProducts,
    getProductById
};
