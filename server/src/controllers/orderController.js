const { pool, query } = require('../config/db');
const NotificationController = require('./notificationController');
const DeliveryService = require('../services/deliveryService');

const createOrder = async (req, res) => {
    const { 
        customer_id, 
        customer_name, 
        customer_email, 
        customer_phone, 
        customer_address, 
        delivery_type, 
        items, 
        coupon_code 
    } = req.body;
    
    console.log('Creating order with backend calculation:', { customer_id, customer_name, itemsCount: items?.length, coupon_code });

    const client = await pool.connect();
    const DELIVERY_FEE = 0.50;

    try {
        await client.query('BEGIN');

        let subtotal = 0;
        const verifiedItems = [];

        // 1. Verify all products and calculate real subtotal
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        for (const item of items) {
            const productRes = await client.query(
                'SELECT id, name, price, stock_quantity FROM products WHERE id = $1 FOR SHARE',
                [item.product_id]
            );

            if (productRes.rows.length === 0) {
                throw new Error(`Product with ID ${item.product_id} not found`);
            }

            const product = productRes.rows[0];
            
            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }

            const itemPrice = Number(product.price);
            const itemSubtotal = itemPrice * Number(item.quantity);
            
            subtotal += itemSubtotal;
            verifiedItems.push({
                product_id: product.id,
                quantity: item.quantity,
                subtotal: itemSubtotal.toFixed(2),
                price: itemPrice
            });
        }

        // 2. Handle Coupon
        let couponId = null;
        let discountAmount = 0;

        if (coupon_code) {
            const couponRes = await client.query('SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) FOR UPDATE', [coupon_code]);
            if (couponRes.rows.length > 0) {
                const coupon = couponRes.rows[0];
                const now = new Date();
                const isActive = coupon.is_active && 
                                (!coupon.start_date || new Date(coupon.start_date) <= now) && 
                                (!coupon.end_date || new Date(coupon.end_date) >= now) && 
                                (!coupon.usage_limit || coupon.usage_count < coupon.usage_limit);

                if (isActive && subtotal >= Number(coupon.min_purchase_amount)) {
                    couponId = coupon.id;
                    if (coupon.discount_type === 'percentage') {
                        discountAmount = subtotal * (Number(coupon.discount_value) / 100);
                    } else if (coupon.discount_type === 'fixed') {
                        discountAmount = Number(coupon.discount_value);
                    }
                    discountAmount = Math.min(discountAmount, subtotal);
                    
                    await client.query('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1', [couponId]);
                }
            }
        }

        // 3. Final Price Calculation
        let finalPrice = Math.max(0, subtotal - discountAmount);
        if (delivery_type === 'Delivery') {
            finalPrice += DELIVERY_FEE;
        }

        // 4. Insert into orders table
        const orderResult = await client.query(
            'INSERT INTO orders (customer_id, customer_name, customer_email, customer_phone, customer_address, delivery_type, total_price, coupon_id, discount_amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
            [
                customer_id || 'GUEST', 
                customer_name || 'Walk-in Customer', 
                customer_email || (customer_id === 'GUEST' ? 'walkin@example.com' : null),
                customer_phone || null,
                customer_address || null,
                delivery_type || 'Pick-up',
                finalPrice.toFixed(2), 
                couponId, 
                discountAmount.toFixed(2), 
                'Pending'
            ]
        );

        const orderId = orderResult.rows[0].id;

        // 5. Insert into order_details and update stock
        for (const item of verifiedItems) {
            await client.query(
                'INSERT INTO order_details (order_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4)',
                [orderId, item.product_id, item.quantity, item.subtotal]
            );

            await client.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        await client.query('COMMIT');

        // Pro Way: Initialize delivery record immediately so tracking works during "Baking"
        if (delivery_type === 'Delivery') {
            try {
                await DeliveryService.initializeDelivery(orderId);
                console.log(`[OrderController] Delivery record initialized for Order #${orderId}`);
            } catch (deliveryErr) {
                console.error('[OrderController] Failed to initialize delivery record:', deliveryErr);
            }
        }

        // Real-time stock update
        if (global.io) {
            global.io.emit('stock:updated', { source: 'order', orderId });
        }

        // Notifications
        try {
            if (customer_id && customer_id !== 'GUEST') {
                await NotificationController.createNotification(
                    customer_id,
                    'Order Confirmed',
                    `Your order #${orderId} for ${verifiedItems.length} items has been placed. Total: $${finalPrice.toFixed(2)}`,
                    'success'
                );
            }
        } catch (notifErr) {
            console.error('Failed to create notification:', notifErr);
        }

        res.status(201).json({ message: 'Order created successfully', orderId, totalPrice: finalPrice.toFixed(2) });
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Error creating order:', err);
        res.status(400).json({ message: err.message || 'Server error creating order' });
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
                COALESCE(o.customer_email, u.email, 'walkin@example.com') as customer_email,
                COALESCE(o.customer_phone, u.phone_number) as customer_phone,
                COALESCE(o.customer_address, u.address) as customer_address,
                o.total_price, 
                o.coupon_id,
                o.discount_amount,
                c.code as coupon_code,
                o.status, 
                o.order_date,
                o.start_time,
                o.completed_time,
                o.payment_status,
                o.payment_method,
                o.delivery_type
            FROM orders o
            LEFT JOIN users u ON o.customer_id::text = u.id::text
            LEFT JOIN coupons c ON o.coupon_id = c.id
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
            p.image_url,
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
            SELECT o.id, o.customer_name, o.customer_email, o.customer_phone, o.customer_address, o.delivery_type, o.total_price, o.coupon_id, o.discount_amount, c.code as coupon_code, o.status, o.order_date, o.start_time, o.completed_time, o.payment_status, o.payment_method
            FROM orders o
            LEFT JOIN coupons c ON o.coupon_id = c.id
            WHERE o.customer_id = $1
            ORDER BY o.order_date DESC
            `, [userId]);

        const orders = [];
        for (const row of result.rows) {
            const itemsResult = await query(`
        SELECT
        od.id,
            od.product_id,
            p.name as product_name,
            p.image_url,
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
    const { status, payment_status } = req.body;

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

        let updateFields = [];
        const params = [];
        let paramCount = 1;

        if (status) {
            updateFields.push(`status = $${paramCount++}`);
            params.push(status);
            
            if (status === 'Baking') {
                updateFields.push(`start_time = CURRENT_TIMESTAMP`);
            } else if (status === 'Completed') {
                updateFields.push(`completed_time = CURRENT_TIMESTAMP`);
            } else if (status === 'Ready') {
                // Trigger delivery if it's a delivery order
                if (currentOrder.delivery_type === 'Delivery') {
                    // Dispatch the delivery (assign driver, start simulation)
                    try {
                        await DeliveryService.dispatchDelivery(id);
                        console.log(`[OrderController] Delivery dispatched for Order #${id}`);
                    } catch (deliveryErr) {
                        console.error('[OrderController] Failed to dispatch delivery:', deliveryErr);
                    }
                }
            }
        }

        if (payment_status) {
            updateFields.push(`payment_status = $${paramCount++}`);
            params.push(payment_status);
        }

        if (updateFields.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'No fields to update' });
        }

        const updateQuery = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
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
                o.customer_email,
                o.customer_phone,
                o.customer_address,
                o.total_price, 
                o.coupon_id,
                o.discount_amount,
                c.code as coupon_code,
                o.status, 
                o.order_date,
                o.start_time,
                o.completed_time,
                o.payment_status,
                o.payment_method,
                o.delivery_type
            FROM orders o
            LEFT JOIN coupons c ON o.coupon_id = c.id
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
                p.image_url,
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
