const { pool, query } = require('../config/db');

const createOrder = async (req, res) => {
    const { customer_id, customer_name, total_price, items } = req.body;
    console.log('Creating order:', { customer_id, customer_name, total_price, itemsCount: items?.length });

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insert into orders table
        const orderResult = await client.query(
            'INSERT INTO orders (customer_id, customer_name, total_price, status) VALUES ($1, $2, $3, $4) RETURNING id',
            [customer_id || 'GUEST', customer_name || 'Walk-in Customer', total_price, 'Pending']
        );

        const orderId = orderResult.rows[0].id;

        // 2. Insert into order_details table
        for (const item of items) {
            // item should have product_id, quantity, subtotal
            await client.query(
                'INSERT INTO order_details (order_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4)',
                [orderId, item.product_id, item.quantity, item.subtotal]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Order created successfully', orderId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Server error creating order', error: err.message });
    } finally {
        if (client) client.release();
    }
};

const getOrders = async (req, res) => {
    try {
        // Simple join to get order info and customer name
        // We might want to get items too, but that might be a separate query or a complex join
        const result = await query(`
            SELECT 
                o.id, 
                o.customer_id, 
                COALESCE(o.customer_name, u.name, 'Unknown') as customer_name, 
                u.email as customer_email,
                o.total_price, 
                o.status, 
                o.order_date
            FROM orders o
            LEFT JOIN users u ON o.customer_id::varchar = u.id::varchar
            ORDER BY o.order_date DESC
        `);

        // Now for each order, fetch items
        const orders = [];
        for (const row of result.rows) {
            const itemsResult = await query(`
                SELECT 
                    od.id, 
                    od.product_id, 
                    p.name as product_name, 
                    od.quantity, 
                    od.subtotal
                FROM order_details od
                JOIN products p ON od.product_id = p.id
                WHERE od.order_id = $1
            `, [row.id]);

            orders.push({
                ...row,
                items: itemsResult.rows
            });
        }

        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

const getMyOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await query(`
            SELECT id, total_price, status, order_date
            FROM orders
            WHERE customer_id = $1
            ORDER BY order_date DESC
        `, [userId]);

        const orders = [];
        for (const row of result.rows) {
            const itemsResult = await query(`
                SELECT 
                    od.id, 
                    od.product_id, 
                    p.name as product_name, 
                    od.quantity, 
                    od.subtotal
                FROM order_details od
                JOIN products p ON od.product_id = p.id
                WHERE od.order_id = $1
            `, [row.id]);

            orders.push({
                ...row,
                items: itemsResult.rows
            });
        }

        res.json(orders);
    } catch (err) {
        console.error('Error fetching my orders:', err);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Server error updating order status' });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getMyOrders,
    updateOrderStatus
};
