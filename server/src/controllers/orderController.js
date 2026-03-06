const { pool, query } = require('../config/db');
const NotificationController = require('./notificationController');

const createOrder = async (req, res) => {
    const { customer_id, customer_name, total_price, items, coupon_code } = req.body;
    console.log('Creating order:', { customer_id, customer_name, total_price, itemsCount: items?.length, coupon_code });

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let couponId = null;
        let discountAmount = 0;
        let finalPrice = Number(total_price);

        if (coupon_code) {
            const couponRes = await client.query('SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) FOR UPDATE', [coupon_code]);
            if (couponRes.rows.length > 0) {
                const coupon = couponRes.rows[0];
                if (coupon.is_active) {
                    const now = new Date();
                    const validStart = !coupon.start_date || new Date(coupon.start_date) <= now;
                    const validEnd = !coupon.end_date || new Date(coupon.end_date) >= now;
                    const validUsage = !coupon.usage_limit || coupon.usage_count < coupon.usage_limit;

                    if (validStart && validEnd && validUsage) {
                        couponId = coupon.id;

                        // We will trust the total_price from the frontend, but we should record the discount amount applied
                        // The frontend subtracted discountAmount from subtotal to get total_price.
                        // For safety, let's recalculate the discount amount just to record it or trust the frontend's finalPrice.
                        // Let's rely on the frontend's valid subtotal, but we can compute discount based on total_price + discount ? No, let's just use what's passed or recalculate subtotal from items.

                        let subtotal = 0;
                        for (const item of items) {
                            subtotal += Number(item.subtotal);
                        }

                        if (subtotal >= Number(coupon.min_purchase_amount)) {
                            if (coupon.discount_type === 'percentage') {
                                discountAmount = subtotal * (Number(coupon.discount_value) / 100);
                            } else if (coupon.discount_type === 'fixed') {
                                discountAmount = Number(coupon.discount_value);
                            }
                            discountAmount = Math.min(discountAmount, subtotal);
                            finalPrice = subtotal - discountAmount;

                            await client.query('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1', [couponId]);
                        } else {
                            couponId = null; // invalid due to min purchase
                        }
                    }
                }
            }
        }

        // 1. Insert into orders table
        const orderResult = await client.query(
            'INSERT INTO orders (customer_id, customer_name, total_price, coupon_id, discount_amount, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [customer_id || 'GUEST', customer_name || 'Walk-in Customer', finalPrice, couponId, discountAmount, 'Pending']
        );

        const orderId = orderResult.rows[0].id;

        // 2. Insert into order_details table and update stock
        for (const item of items) {
            // item should have product_id, quantity, subtotal
            await client.query(
                'INSERT INTO order_details (order_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4)',
                [orderId, item.product_id, item.quantity, item.subtotal]
            );

            // Decrement Stock
            await client.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        await client.query('COMMIT');

        // Emit real-time stock update for all clients
        if (global.io) {
            global.io.emit('stock:updated', { source: 'order', orderId });
        }
        try {
            // Find an admin to notify (or notify a general channel if implemented)
            // For now, let's assume we notify the customer if they are logged in
            if (customer_id && customer_id !== 'GUEST') {
                await NotificationController.createNotification(
                    customer_id,
                    'Order Confirmed',
                    `Your order #${orderId} has been placed successfully.`,
                    'success'
                );
            }
        } catch (notifErr) {
            console.error('Failed to create notification:', notifErr);
        }

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
                u.phone_number as customer_phone,
                u.address as customer_address,
                o.total_price, 
                o.coupon_id,
                o.discount_amount,
                o.status, 
                o.order_date,
                o.start_time,
                o.completed_time,
                o.payment_status,
                o.payment_method
            FROM orders o
            LEFT JOIN users u ON o.customer_id::text = u.id::text
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
        console.error('Detailed Error fetching orders:', err);
        res.status(500).json({ message: 'Server error fetching orders', error: err.message, stack: err.stack });
    }
};

const getMyOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await query(`
            SELECT id, total_price, coupon_id, discount_amount, status, order_date, start_time, completed_time, payment_status, payment_method
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

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch current order to check previous state
        const orderRes = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Order not found' });
        }
        const currentOrder = orderRes.rows[0];

        // Ensure Customers can only cancel their own pending/unpaid orders.
        if (req.user && req.user.role === 'Customer') {
            if (currentOrder.customer_id !== req.user.id) {
                await client.query('ROLLBACK');
                return res.status(403).json({ message: 'Not authorized to modify this order' });
            }
            if (status !== 'Cancelled') {
                await client.query('ROLLBACK');
                return res.status(403).json({ message: 'Customers can only cancel orders' });
            }
            if (currentOrder.status !== 'Pending' || currentOrder.payment_status === 'Paid') {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Only pending, unpaid orders can be cancelled' });
            }
        }

        let updateQuery = 'UPDATE orders SET status = $1';
        const params = [status];

        if (status === 'Baking') {
            updateQuery += ', start_time = CURRENT_TIMESTAMP';
        } else if (status === 'Completed') {
            updateQuery += ', completed_time = CURRENT_TIMESTAMP';
        }

        updateQuery += ' WHERE id = $2 RETURNING *';
        params.push(id);

        const result = await client.query(updateQuery, params);
        const order = result.rows[0];

        // Handle Stock and Coupon restore on Cancellation
        if (status === 'Cancelled' && currentOrder.status !== 'Cancelled') {
            // Revert coupon usage
            if (currentOrder.coupon_id) {
                await client.query(
                    'UPDATE coupons SET usage_count = GREATEST(0, usage_count - 1) WHERE id = $1',
                    [currentOrder.coupon_id]
                );
            }

            // Restore product stock
            const itemsRes = await client.query(
                'SELECT product_id, quantity FROM order_details WHERE order_id = $1',
                [id]
            );

            for (const item of itemsRes.rows) {
                await client.query(
                    'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );
            }

            // Emit real-time stock update
            if (global.io) {
                global.io.emit('stock:updated', { source: 'order_cancelled', orderId: id });
            }
        }

        await client.query('COMMIT');

        // Create notification for the customer
        try {
            if (order.customer_id && order.customer_id !== 'GUEST') {
                await NotificationController.createNotification(
                    order.customer_id,
                    'Order Status Updated',
                    `Your order #${id} status is now: ${status}`,
                    status === 'Completed' ? 'success' : (status === 'Cancelled' ? 'error' : 'info')
                );
            }
        } catch (notifErr) {
            console.error('Failed to create status notification:', notifErr);
        }

        res.json(order);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Server error updating order status' });
    } finally {
        if (client) client.release();
    }
};

const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query(`
            SELECT 
                o.id, 
                o.customer_id, 
                o.customer_name, 
                o.total_price, 
                o.coupon_id,
                o.discount_amount,
                o.status, 
                o.order_date,
                o.start_time,
                o.completed_time,
                o.payment_status,
                o.payment_method
            FROM orders o
            WHERE o.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = result.rows[0];

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
        `, [id]);

        res.json({
            ...order,
            items: itemsResult.rows
        });
    } catch (err) {
        console.error('Error fetching order by ID:', err);
        res.status(500).json({ message: 'Server error fetching order' });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus
};
