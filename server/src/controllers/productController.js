const { query } = require('../config/db');
const NotificationController = require('./notificationController');

const getProducts = async (req, res) => {
    try {
        const result = await query(`
            SELECT p.*, 
                   COALESCE(AVG(pr.rating), 0) as avg_rating,
                   COUNT(pr.rating) as total_votes,
                   fsi.sale_price as flash_sale_price,
                   fsi.flash_sale_stock,
                   fsi.sold_quantity as flash_sale_sold,
                   fsi.end_time as flash_sale_end
            FROM products p
            LEFT JOIN product_ratings pr ON p.id = pr.product_id
            LEFT JOIN (
                SELECT i.*, s.end_time
                FROM flash_sale_items i
                JOIN flash_sales s ON i.flash_sale_id = s.id
                WHERE s.is_active = TRUE 
                  AND s.start_time <= CURRENT_TIMESTAMP 
                  AND s.end_time >= CURRENT_TIMESTAMP
            ) fsi ON p.id = fsi.product_id
            WHERE p.is_active = TRUE
            GROUP BY p.id, fsi.sale_price, fsi.flash_sale_stock, fsi.sold_quantity, fsi.end_time
            ORDER BY p.id ASC
        `);

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
            ingredients: Array.isArray(p.ingredients) ? p.ingredients : JSON.parse(p.ingredients || '[]'),
            allergens: Array.isArray(p.allergens) ? p.allergens : JSON.parse(p.allergens || '[]'),
            rating: parseFloat(p.avg_rating).toFixed(1),
            totalVotes: parseInt(p.total_votes),
            flashSale: p.flash_sale_price ? {
                salePrice: parseFloat(p.flash_sale_price),
                stock: p.flash_sale_stock,
                sold: p.flash_sale_sold,
                endTime: p.flash_sale_end
            } : null
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
        const result = await query(`
            SELECT p.*, 
                   COALESCE(AVG(pr.rating), 0) as avg_rating,
                   COUNT(pr.rating) as total_votes,
                   fsi.sale_price as flash_sale_price,
                   fsi.flash_sale_stock,
                   fsi.sold_quantity as flash_sale_sold,
                   fsi.end_time as flash_sale_end
            FROM products p
            LEFT JOIN product_ratings pr ON p.id = pr.product_id
            LEFT JOIN (
                SELECT i.*, s.end_time
                FROM flash_sale_items i
                JOIN flash_sales s ON i.flash_sale_id = s.id
                WHERE s.is_active = TRUE 
                  AND s.start_time <= CURRENT_TIMESTAMP 
                  AND s.end_time >= CURRENT_TIMESTAMP
            ) fsi ON p.id = fsi.product_id
            WHERE p.id = $1
            GROUP BY p.id, fsi.sale_price, fsi.flash_sale_stock, fsi.sold_quantity, fsi.end_time
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const p = result.rows[0];
        const product = {
            ...p,
            rating: parseFloat(p.avg_rating).toFixed(1),
            totalVotes: parseInt(p.total_votes),
            flashSale: p.flash_sale_price ? {
                salePrice: parseFloat(p.flash_sale_price),
                stock: p.flash_sale_stock,
                sold: p.flash_sale_sold,
                endTime: p.flash_sale_end
            } : null
        };
        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ message: 'Server error fetching product' });
    }
};

const createProduct = async (req, res) => {
    console.log('Create Product Request Body:', req.body);
    console.log('Create Product Request File:', req.file);
    const { name, category, price, description, unit, ingredients, allergens } = req.body;
    let image_url = req.body.image_url || req.body.image; // Default if provided as string

    const reqStock = req.body.stock_quantity !== undefined ? req.body.stock_quantity : req.body.stock;
    const reqMinStock = req.body.min_stock_level !== undefined ? req.body.min_stock_level : req.body.min_stock;

    // Parse ingredients and allergens if they are strings (from FormData)
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients || '[]') : (ingredients || []);
    const parsedAllergens = typeof allergens === 'string' ? JSON.parse(allergens || '[]') : (allergens || []);

    // If a file was uploaded by multer
    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        const result = await query(
            'INSERT INTO products (name, category, price, description, image_url, stock_quantity, min_stock_level, unit, ingredients, allergens) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [name, category, price, description, image_url, reqStock || 0, reqMinStock || 5, unit || 'pcs', JSON.stringify(parsedIngredients), JSON.stringify(parsedAllergens)]
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
    const { name, category, price, description, unit, ingredients, allergens } = req.body;
    let image_url = req.body.image_url || req.body.image;

    // Parse ingredients and allergens if they are strings (from FormData)
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients || '[]') : (ingredients || []);
    const parsedAllergens = typeof allergens === 'string' ? JSON.parse(allergens || '[]') : (allergens || []);

    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        // Fetch existing product to preserve stock and min stock level if not provided
        const existingResult = await query('SELECT stock_quantity, min_stock_level FROM products WHERE id = $1', [id]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const existingProduct = existingResult.rows[0];

        const reqStock = req.body.stock_quantity !== undefined ? req.body.stock_quantity : req.body.stock;
        const reqMinStock = req.body.min_stock_level !== undefined ? req.body.min_stock_level : req.body.min_stock;

        // Parse float values cleanly, falling back to DB values if omitted, empty, or invalid number
        const parsedReqStock = parseFloat(reqStock);
        const parsedReqMinStock = parseFloat(reqMinStock);

        const finalStock = (!isNaN(parsedReqStock) && reqStock !== '' && reqStock !== undefined) 
            ? parsedReqStock 
            : parseFloat(existingProduct.stock_quantity || 0);

        const finalMinStock = (!isNaN(parsedReqMinStock) && reqMinStock !== '' && reqMinStock !== undefined) 
            ? parsedReqMinStock 
            : parseFloat(existingProduct.min_stock_level || 5);

        let updateQuery = 'UPDATE products SET name = $1, category = $2, price = $3, description = $4, stock_quantity = $5, min_stock_level = $6, unit = $7, ingredients = $8, allergens = $9';
        let params = [name, category, price, description, finalStock, finalMinStock, unit, JSON.stringify(parsedIngredients), JSON.stringify(parsedAllergens), id];

        if (image_url !== undefined) {
            updateQuery += ', image_url = $10 WHERE id = $11';
            params = [name, category, price, description, finalStock, finalMinStock, unit, JSON.stringify(parsedIngredients), JSON.stringify(parsedAllergens), image_url, id];
        } else {
            updateQuery += ' WHERE id = $10';
        }

        const result = await query(updateQuery + ' RETURNING *', params);

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

        // Check for low stock alert
        const product = result.rows[0];
        if (product.stock_quantity <= product.min_stock_level) {
            await NotificationController.notifyAdmins(
                'Low Stock Alert',
                `Product "${product.name}" is low on stock (${product.stock_quantity} left).`,
                'warning'
            );
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating stock:', err);
        res.status(500).json({ message: 'Server error updating stock' });
    }
};

const getTags = async (req, res) => {
    try {
        const result = await query('SELECT * FROM predefined_tags ORDER BY name ASC');
        const tags = {
            ingredients: result.rows.filter(t => t.type === 'ingredient').map(t => t.name),
            allergens: result.rows.filter(t => t.type === 'allergen').map(t => t.name)
        };
        res.json(tags);
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ message: 'Server error fetching tags' });
    }
};

const submitRating = async (req, res) => {
    const { id: productId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Invalid rating. Must be between 1 and 5.' });
    }

    try {
        // Upsert rating
        await query(`
            INSERT INTO product_ratings (product_id, user_id, rating)
            VALUES ($1, $2, $3)
            ON CONFLICT (product_id, user_id)
            DO UPDATE SET rating = EXCLUDED.rating, created_at = CURRENT_TIMESTAMP
        `, [productId, userId, rating]);

        // Fetch updated average
        const result = await query(`
            SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_votes
            FROM product_ratings
            WHERE product_id = $1
        `, [productId]);

        const updated = result.rows[0];
        
        // Emit real-time update
        if (global.io) {
            global.io.emit('product:rating_updated', {
                productId: productId,
                rating: parseFloat(updated.avg_rating).toFixed(1),
                totalVotes: parseInt(updated.total_votes)
            });
        }

        res.json({ 
            message: 'Rating submitted successfully',
            rating: parseFloat(updated.avg_rating).toFixed(1),
            totalVotes: parseInt(updated.total_votes)
        });
    } catch (err) {
        console.error('Error submitting rating:', err);
        res.status(500).json({ message: 'Server error submitting rating' });
    }
};

const resetRatings = async (req, res) => {
    const { id: productId } = req.params;

    try {
        await query('DELETE FROM product_ratings WHERE product_id = $1', [productId]);
        
        // Emit real-time update
        if (global.io) {
            global.io.emit('product:rating_updated', {
                productId: productId,
                rating: "0.0",
                totalVotes: 0
            });
        }

        res.json({ message: 'Ratings reset successfully' });
    } catch (err) {
        console.error('Error resetting ratings:', err);
        res.status(500).json({ message: 'Server error resetting ratings' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getTags,
    submitRating,
    resetRatings
};
