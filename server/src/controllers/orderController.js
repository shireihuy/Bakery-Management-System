const { pool, query } = require('../config/db');
const NotificationController = require('./notificationController');
const DeliveryService = require('../services/deliveryService');
const payos = require('../config/payos');

const GHNClient = require('../utils/ghnClient');

const createOrder = async (req, res) => {
    const { 
        customer_id: body_customer_id,
        customer_name: body_customer_name,
        customer_email: body_customer_email,
        customer_address, 
        customer_phone,
        district_id,
        ward_code,
        delivery_type, 
        items, 
        coupon_code 
    } = req.body;

    const customer_id = body_customer_id || req.user?.id || 'GUEST';
    let customer_name = body_customer_name || req.user?.name || 'Walk-in Customer';
    let customer_email = body_customer_email || req.user?.email || (customer_id === 'GUEST' ? 'walkin@example.com' : null);
    
    // If Admin places order for someone else, respect the provided name
    if (req.user?.role === 'Cashier' || req.user?.role === 'Admin') {
        customer_name = body_customer_name || 'Walk-in Customer';
        customer_email = body_customer_email || 'walkin@example.com';
    }

    const finalPhone = customer_phone || req.user?.phone || null;
    
    console.log('Creating order with backend calculation:', { customer_id, customer_name, itemsCount: items?.length, coupon_code });

    const client = await pool.connect();
    let DELIVERY_FEE = 0.50; // Minimum default

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

            // 1.1 Check for active flash sale
            const flashSaleRes = await client.query(`
                SELECT fsi.*, fs.end_time
                FROM flash_sale_items fsi
                JOIN flash_sales fs ON fsi.flash_sale_id = fs.id
                WHERE fsi.product_id = $1
                AND fs.is_active = TRUE
                AND fs.start_time <= CURRENT_TIMESTAMP
                AND fs.end_time >= CURRENT_TIMESTAMP
                FOR UPDATE
            `, [product.id]);

            let itemPrice = Number(product.price);
            let isFlashSale = false;
            let flashSaleItemId = null;
            let itemSubtotal = 0;
            let saleQty = 0;
            let normalQty = Number(item.quantity);

            if (flashSaleRes.rows.length > 0) {
                const fsi = flashSaleRes.rows[0];
                const availableSaleStock = Math.max(0, fsi.flash_sale_stock - fsi.sold_quantity);
                
                if (availableSaleStock > 0) {
                    saleQty = Math.min(normalQty, availableSaleStock);
                    normalQty -= saleQty;
                    itemSubtotal = (saleQty * Number(fsi.sale_price)) + (normalQty * itemPrice);
                    isFlashSale = true;
                    flashSaleItemId = fsi.id;
                    // For the record, we'll store the 'average' price or just the subtotal
                    // But for order_details, we usually store the subtotal.
                } else {
                    itemSubtotal = normalQty * itemPrice;
                }
            } else {
                itemSubtotal = normalQty * itemPrice;
            }

            subtotal += itemSubtotal;
            verifiedItems.push({
                product_id: product.id,
                quantity: item.quantity,
                sale_quantity: saleQty, // Track how many were actually on sale
                subtotal: itemSubtotal.toFixed(2),
                price: itemPrice, // Base price
                isFlashSale,
                flashSaleItemId
            });
        }


        // 2. Handle Delivery Fee
        if (delivery_type === 'Delivery') {
            if (district_id && ward_code) {
                try {
                    const settingsRes = await client.query('SELECT value FROM system_settings WHERE key = $1', ['store_location_config']);
                    const from_district_id = settingsRes.rows.length > 0 ? settingsRes.rows[0].value.district_id : 1454;

                    const feeResult = await GHNClient.calculateFee({
                        from_district_id: parseInt(from_district_id),
                        to_district_id: district_id,
                        to_ward_code: ward_code,
                        weight: verifiedItems.length * 200 // Mock 200g per item
                    });
                    DELIVERY_FEE = Number(feeResult.total) / 25000; // Convert to USD approximately
                    console.log(`[GHN] Calculated Fee: $${DELIVERY_FEE.toFixed(2)} for District ${district_id}`);
                } catch (ghnErr) {
                    console.error('[GHN] Fee calculation failed, falling back to default:', ghnErr.message);
                }
            }
        }

        // 3. Handle Coupon (applied to total including shipping if user wants)
        let couponId = null;
        let discountAmount = 0;
        const totalBeforeDiscount = subtotal + (delivery_type === 'Delivery' ? DELIVERY_FEE : 0);

        if (coupon_code) {
            const couponRes = await client.query('SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) FOR UPDATE', [coupon_code]);
            if (couponRes.rows.length > 0) {
                const coupon = couponRes.rows[0];
                const now = new Date();
                const isActive = coupon.is_active && 
                                (!coupon.start_date || new Date(coupon.start_date) <= now) && 
                                (!coupon.end_date || new Date(coupon.end_date) >= now) && 
                                (!coupon.usage_limit || coupon.usage_count < coupon.usage_limit);

                // Min purchase still usually applies to items subtotal
                if (isActive && subtotal >= Number(coupon.min_purchase_amount)) {
                    couponId = coupon.id;
                    if (coupon.discount_type === 'percentage') {
                        discountAmount = totalBeforeDiscount * (Number(coupon.discount_value) / 100);
                    } else if (coupon.discount_type === 'fixed') {
                        discountAmount = Number(coupon.discount_value);
                    }
                    discountAmount = Math.min(discountAmount, totalBeforeDiscount);
                    
                    await client.query('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1', [couponId]);
                }
            }
        }

        // 4. Final Price Calculation
        let finalPrice = Math.max(0, totalBeforeDiscount - discountAmount);

        // 4. Insert into orders table
        const orderResult = await client.query(
            'INSERT INTO orders (customer_id, customer_name, customer_email, customer_phone, customer_address, district_id, ward_code, delivery_type, total_price, coupon_id, discount_amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
            [
                customer_id || 'GUEST', 
                customer_name || 'Walk-in Customer', 
                customer_email || (customer_id === 'GUEST' ? 'walkin@example.com' : null),
                finalPhone,
                customer_address || null,
                district_id || null,
                ward_code || null,
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

            if (item.isFlashSale && item.flashSaleItemId && item.sale_quantity > 0) {
                await client.query(
                    'UPDATE flash_sale_items SET sold_quantity = sold_quantity + $1 WHERE id = $2',
                    [item.sale_quantity, item.flashSaleItemId]
                );
            }
        }


        await client.query('COMMIT');

        // Pro Way: Initialize delivery record immediately so tracking works during "Baking"
        if (delivery_type === 'Delivery') {
            try {
                await DeliveryService.initializeDelivery(orderId, DELIVERY_FEE);
                console.log(`[OrderController] Delivery record initialized for Order #${orderId} with fee: $${DELIVERY_FEE.toFixed(2)}`);
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
                o.delivery_type,
                o.district_id,
                o.ward_code,
                o.cancel_reason,
                d.delivery_fee
            FROM orders o
            LEFT JOIN users u ON o.customer_id::text = u.id::text
            LEFT JOIN coupons c ON o.coupon_id = c.id
            LEFT JOIN deliveries d ON o.id = d.order_id
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
            SELECT o.id, o.customer_name, o.customer_email, o.customer_phone, o.customer_address, o.district_id, o.ward_code, o.delivery_type, o.total_price, o.coupon_id, o.discount_amount, c.code as coupon_code, o.status, o.order_date, o.start_time, o.completed_time, o.payment_status, o.payment_method, o.cancel_reason, d.delivery_fee
            FROM orders o
            LEFT JOIN coupons c ON o.coupon_id = c.id
            LEFT JOIN deliveries d ON o.id = d.order_id
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
    const { status, payment_status, cancel_reason } = req.body;

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

        if (cancel_reason && status === 'Cancelled') {
            updateFields.push(`cancel_reason = $${paramCount++}`);
            params.push(cancel_reason);
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
            const itemsRes = await client.query(`
                SELECT od.product_id, od.quantity, fsi.id as flash_sale_item_id
                FROM order_details od
                LEFT JOIN products p ON od.product_id = p.id
                LEFT JOIN flash_sale_items fsi ON p.id = fsi.product_id
                JOIN orders o ON od.order_id = o.id
                JOIN flash_sales fs ON fsi.flash_sale_id = fs.id
                WHERE od.order_id = $1 
                  AND fs.start_time <= o.order_date 
                  AND fs.end_time >= o.order_date
            `, [id]);

            // Note: The logic above for finding the flash sale item is a bit complex 
            // because we didn't store flash_sale_item_id in order_details.
            // Ideally we should add flash_sale_item_id to order_details table.
            // Let's do a simpler approach: check if subtotal/quantity matches flash sale price at that time.
            
            const allItemsRes = await client.query(
                'SELECT product_id, quantity, subtotal FROM order_details WHERE order_id = $1',
                [id]
            );

            for (const item of allItemsRes.rows) {
                await client.query(
                    'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );

                // Check if this item was a flash sale item
                const unitPrice = Number(item.subtotal) / item.quantity;
                const fsCheck = await client.query(`
                    SELECT fsi.id 
                    FROM flash_sale_items fsi
                    JOIN flash_sales fs ON fsi.flash_sale_id = fs.id
                    JOIN orders o ON o.id = $1
                    WHERE fsi.product_id = $2 
                      AND ABS(fsi.sale_price - $3) < 0.01
                      AND fs.start_time <= o.order_date 
                      AND fs.end_time >= o.order_date
                `, [id, item.product_id, unitPrice]);

                if (fsCheck.rows.length > 0) {
                    await client.query(
                        'UPDATE flash_sale_items SET sold_quantity = GREATEST(0, sold_quantity - $1) WHERE id = $2',
                        [item.quantity, fsCheck.rows[0].id]
                    );
                }
            }


            // Sync PayOS cancellation
            if (currentOrder.payment_method === 'qr' || currentOrder.payment_method === 'QR (PayOS)') {
                try {
                    console.log(`[OrderController] Cancelling PayOS link for Order #${id}`);
                    await payos.paymentRequests.cancel(id);
                } catch (payosErr) {
                    console.error('[OrderController] Failed to cancel PayOS link:', payosErr.message);
                }
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
                if (status) {
                    // Notify on order status changes only
                    await NotificationController.createNotification(
                        order.customer_id,
                        'Order Status Updated',
                        `Your order #${id} status is now: ${status}`,
                        status === 'Completed' ? 'success' : (status === 'Cancelled' ? 'error' : 'info')
                    );
                } else if (payment_status === 'Paid') {
                    // Notify on payment confirmation
                    await NotificationController.createNotification(
                        order.customer_id,
                        'Payment Confirmed',
                        `Your payment for order #${id} has been confirmed. Thank you!`,
                        'success'
                    );
                }
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
                o.delivery_type,
                o.district_id,
                o.ward_code,
                o.cancel_reason,
                d.delivery_fee,
                o.payment_url,
                o.transaction_id,
                o.qr_code
            FROM orders o
            LEFT JOIN coupons c ON o.coupon_id = c.id
            LEFT JOIN deliveries d ON o.id = d.order_id
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
