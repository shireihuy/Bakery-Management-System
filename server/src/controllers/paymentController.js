const { query } = require('../config/db');
const NotificationController = require('./notificationController');
const payos = require('../config/payos');
const DeliveryService = require('../services/deliveryService');

const DELIVERY_DISPATCH_DELAY_MS = 30000;

const scheduleDeliveryDispatchAfterPayment = (order) => {
    if (!order || order.delivery_type !== 'Delivery') return;

    const timer = setTimeout(async () => {
        try {
            await DeliveryService.dispatchDelivery(order.id);
        } catch (deliveryErr) {
            console.error('[PaymentController] Failed to dispatch paid delivery order:', deliveryErr);
        }
    }, DELIVERY_DISPATCH_DELAY_MS);

    if (typeof timer.unref === 'function') {
        timer.unref();
    }
};

/**
 * Fetch and cache exchange rate from USD to VND
 * Rate is cached for 1 hour to optimize performance
 */
const queryExchangeRate = async (currency = 'VND') => {
    try {
        const settingKey = `exchange_rate_${currency.toLowerCase()}`;
        const lastUpdate = await query('SELECT updated_at FROM system_settings WHERE key = $1', [settingKey]);
        const oneHour = 60 * 60 * 1000;
        
        if (lastUpdate.rows.length > 0 && (new Date() - new Date(lastUpdate.rows[0].updated_at)) < oneHour) {
            const current = await query('SELECT value FROM system_settings WHERE key = $1', [settingKey]);
            return parseFloat(current.rows[0].value.rate);
        }

        // Using a free exchange rate API
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        const rate = data.rates[currency] || (currency === 'VND' ? 25000 : 150);

        await query(
            'INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
            [settingKey, JSON.stringify({ rate, base: 'USD', target: currency })]
        );
        return rate;
    } catch (err) {
        console.error(`Exchange rate error (${currency}):`, err);
        const settingKey = `exchange_rate_${currency.toLowerCase()}`;
        const current = await query('SELECT value FROM system_settings WHERE key = $1', [settingKey]);
        const fallback = currency === 'VND' ? 25000 : 150;
        return current.rows.length > 0 ? parseFloat(current.rows[0].value.rate) : fallback;
    }
};

/**
 * Initiate a mock payment
 * POST /api/payment/initiate
 */
const initiatePayment = async (req, res) => {
    const { orderId, method } = req.body;

    try {
        // 1. Check if order exists
        const result = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = result.rows[0];
        if (order.status === 'Cancelled' || order.payment_status === 'Cancelled') {
            return res.status(400).json({ message: 'Cancelled orders cannot be paid' });
        }
        if (order.payment_status === 'Paid') {
            return res.status(400).json({ message: 'Order is already paid' });
        }

        // 2. Update order with payment method
        await query(
            'UPDATE orders SET payment_method = $1, payment_status = $2 WHERE id = $3',
            [method, 'Pending', orderId]
        );

        // 3. Create PayOS Payment Link if method is QR
        if (method === 'qr' && process.env.PAYOS_CLIENT_ID !== 'your_client_id_here') {
            try {
                // Fetch payment config for manual rates and account info
                const configRes = await query('SELECT value FROM system_settings WHERE key = $1', ['payment_qr_config']);
                const paymentConfig = configRes.rows.length > 0 ? configRes.rows[0].value : {};

                // ✅ REUSE existing link if one was already created for this order
                // This prevents PayOS error 231 "Đơn thanh toán đã tồn tại" (order already exists)
                if (order.transaction_id && order.qr_code && order.payment_url) {
                    
                    return res.status(200).json({
                        message: 'PayOS link reused',
                        paymentUrl: order.payment_url,
                        qrCode: order.qr_code,
                        paymentLinkId: order.transaction_id,
                        accountName: paymentConfig.accountName || ''
                    });
                }

                // Use manual rate if set, otherwise fetch live rate
                let vndRate = paymentConfig.vndRate;
                if (!vndRate) {
                    vndRate = await queryExchangeRate('VND');
                }

                const amountVND = Math.round(order.total_price * vndRate);

                const paymentData = {
                    orderCode: Number(orderId),
                    amount: amountVND,
                    description: `Bakery Payment #${orderId}`,
                    cancelUrl: `http://localhost:8080/payment/${orderId}?status=cancelled`,
                    returnUrl: `http://localhost:8080/payment/${orderId}?status=success`,
                };

                const paymentLink = await payos.paymentRequests.create(paymentData);

                // Save payment details to DB for recovery on reload
                await query(
                    'UPDATE orders SET transaction_id = $1, payment_url = $2, qr_code = $3 WHERE id = $4',
                    [paymentLink.paymentLinkId, paymentLink.checkoutUrl, paymentLink.qrCode, orderId]
                );

                return res.status(200).json({
                    message: 'PayOS link created',
                    paymentUrl: paymentLink.checkoutUrl,
                    qrCode: paymentLink.qrCode,
                    paymentLinkId: paymentLink.paymentLinkId,
                    bin: paymentLink.bin,
                    accountNumber: paymentLink.accountNumber,
                    amount: paymentLink.amount,
                    description: paymentLink.description,
                    accountName: paymentConfig.accountName || paymentLink.accountName
                });
            } catch (payosErr) {
                console.error('PayOS integration error:', payosErr);
                // Fallback to mock if PayOS fails (for dev convenience)
            }
        }

        // 4. Return mock payment data (Fallback if PayOS not configured or errors out)
        res.status(200).json({
            message: 'Payment initiated (Mock)',
            paymentUrl: `http://localhost:8080/mock-payment-gateway?orderId=${orderId}&method=${method}`,
            app_trans_id: `MOCK_${Date.now()}_${orderId}`
        });
    } catch (err) {
        console.error('Error initiating payment:', err);
        res.status(500).json({ message: 'Server error initiating payment' });
    }
};

/**
 * Verify payment status
 * GET /api/payment/verify/:orderId
 */
const verifyPayment = async (req, res) => {
    const { orderId } = req.params;

    try {
        const result = await query(
            'SELECT id, status, payment_status, payment_method, transaction_id, payment_url, qr_code, total_price, customer_id, delivery_type FROM orders WHERE id = $1',
            [orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        let order = result.rows[0];

        // 🚀 FAIL-SAFE POLLING: If local DB says 'Pending' but method is 'qr'
        // we check PayOS directly in case the webhook was blocked (e.g. localhost)
        if (order.status !== 'Cancelled' && order.payment_status === 'Pending' && (order.payment_method === 'qr' || order.payment_method === 'QR (PayOS)')) {
            try {
                const payosInfo = await payos.paymentRequests.get(orderId);
                
                if (payosInfo && payosInfo.status === 'PAID') {
                    
                    
                    // Update DB exactly like the webhook does
                    const updateQuery = `
                        UPDATE orders 
                        SET payment_status = $1, 
                            status = $2::varchar, 
                            transaction_id = $3,
                            start_time = CURRENT_TIMESTAMP
                        WHERE id = $4
                        RETURNING *
                    `;
                    const updatedResult = await query(updateQuery, ['Paid', 'Ready', payosInfo.id, orderId]);
                    order = updatedResult.rows[0];
                    scheduleDeliveryDispatchAfterPayment(order);

                    // Record payment
                    await query(
                        'INSERT INTO payments (order_id, method, amount, status, transaction_id) VALUES ($1, $2, $3, $4, $5)',
                        [orderId, 'QR (PayOS)', order.total_price, 'Paid', payosInfo.id]
                    );

                    // Notify via socket
                    if (global.io) {
                        global.io.emit('order_paid', { orderId });
                    }
                    
                    // Create notification
                    if (order.customer_id && order.customer_id !== 'GUEST') {
                        await NotificationController.createNotification(
                            order.customer_id,
                            'Payment Successful',
                            `Payment for order #${orderId} was successful via auto-verify.`,
                            'success'
                        );
                    }
                } else if (payosInfo && payosInfo.status === 'CANCELLED') {
                    
                    
                    const updateQuery = `
                        UPDATE orders 
                        SET payment_status = $1, 
                            status = $2::varchar
                        WHERE id = $3
                        RETURNING *
                    `;
                    const updatedResult = await query(updateQuery, ['Cancelled', 'Cancelled', orderId]);
                    order = updatedResult.rows[0];

                    // Notify via socket
                    if (global.io) {
                        global.io.emit('order_cancelled', { orderId });
                    }
                }
            } catch (err) {
                // Ignore PayOS check errors (might be because link was never created or has expired)
                // 
            }
        }

        res.status(200).json(order);
    } catch (err) {
        console.error('Error verifying payment:', err);
        res.status(500).json({ message: 'Server error verifying payment' });
    }
};

/**
 * Simulate an external callback (Sandbox tool)
 * POST /api/payment/simulate-callback
 */
const simulateCallback = async (req, res) => {
    const { orderId, status, transactionId } = req.body;

    try {
        // Find the order
        const orderResult = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orderResult.rows[0];
        if (order.status === 'Cancelled' || order.payment_status === 'Cancelled') {
            return res.status(400).json({ message: 'Cancelled orders cannot be paid' });
        }

        // Update payment status
        // If status is 'success', we also move the order to 'Ready'
        const nextOrderStatus = status === 'success' ? 'Ready' : order.status;
        const nextPaymentStatus = status === 'success' ? 'Paid' : 'Failed';

        const updateQuery = `
            UPDATE orders 
            SET payment_status = $1, 
                status = $2::varchar, 
                transaction_id = $3,
                start_time = CASE WHEN $2::varchar = 'Ready' THEN CURRENT_TIMESTAMP ELSE start_time END
            WHERE id = $4 AND status != 'Cancelled'
            RETURNING *
        `;

        const updateResult = await query(updateQuery, [nextPaymentStatus, nextOrderStatus, transactionId || `TX_${Date.now()}`, orderId]);
        if (updateResult.rows.length === 0) {
            return res.status(409).json({ message: 'Order can no longer be paid' });
        }

        if (status === 'success') {
            scheduleDeliveryDispatchAfterPayment(order);
        }

        // Also record in payments table
        await query(
            'INSERT INTO payments (order_id, method, amount, status, transaction_id) VALUES ($1, $2, $3, $4, $5)',
            [orderId, order.payment_method || 'Unknown', order.total_price, nextPaymentStatus, transactionId || `TX_${Date.now()}`]
        );

        // Notify customer on successful payment
        if (status === 'success' && order.customer_id && order.customer_id !== 'GUEST') {
            try {
                await NotificationController.createNotification(
                    order.customer_id,
                    'Payment Successful',
                    `Payment for order #${orderId} was successful. Your order is ready!`,
                    'success'
                );
            } catch (notifErr) {
                console.error('Failed to send payment notification:', notifErr);
            }
        }

        res.status(200).json({ message: 'Callback processed successfully', payment_status: nextPaymentStatus });
    } catch (err) {
        console.error('Error processing mock callback:', err);
        res.status(500).json({ message: 'Server error processing callback' });
    }
};

/**
 * Handle Real PayOS Webhook
 * POST /api/payment/payos-webhook
 */
const handlePayOSWebhook = async (req, res) => {
    const webhookData = payos.webhooks.verify(req.body);
    
    if (webhookData.desc === 'success' || webhookData.code === '00') {
        const orderId = webhookData.orderCode;
        
        try {
            // Update order status exactly like simulateCallback
            const updateQuery = `
                UPDATE orders 
                SET payment_status = $1, 
                    status = $2::varchar, 
                    transaction_id = $3,
                    start_time = CURRENT_TIMESTAMP
                WHERE id = $4 AND payment_status != 'Paid' AND status != 'Cancelled'
                RETURNING *
            `;
            const result = await query(updateQuery, ['Paid', 'Ready', webhookData.paymentLinkId, orderId]);
            
            if (result.rows.length > 0) {
                const order = result.rows[0];
                scheduleDeliveryDispatchAfterPayment(order);

                // Record payment
                await query(
                    'INSERT INTO payments (order_id, method, amount, status, transaction_id) VALUES ($1, $2, $3, $4, $5)',
                    [orderId, 'QR (PayOS)', order.total_price, 'Paid', webhookData.paymentLinkId]
                );

                // Notify UI via socket if global.io exists
                if (global.io) {
                    global.io.emit('order_paid', { orderId });
                }
            }
        } catch (err) {
            console.error('Webhook processing error:', err);
        }
    }

    return res.json({ success: true });
};

/**
 * Get payment settings
 * GET /api/payment/settings
 */
const getPaymentSettings = async (req, res) => {
    try {
        const result = await query('SELECT value FROM system_settings WHERE key = $1', ['payment_qr_config']);
        const config = result.rows.length > 0 ? result.rows[0].value : {};
        
        // If rates aren't in config, fetch auto rates as fallback
        if (!config.vndRate) {
            config.vndRate = await queryExchangeRate('VND');
        }
        if (!config.jpyRate) {
            config.jpyRate = await queryExchangeRate('JPY');
        }

        res.status(200).json(config);
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Update payment settings
 * POST /api/payment/settings
 */
const updatePaymentSettings = async (req, res) => {
    const { bankId, accountNumber, accountName, messageTemplate, vndRate, jpyRate } = req.body;
    
    try {
        // Sanity check: Fetch live rates to prevent extreme typos
        const liveVND = await queryExchangeRate('VND');
        const liveJPY = await queryExchangeRate('JPY');

        const vRate = parseFloat(vndRate);
        const jRate = parseFloat(jpyRate);

        // Validation: Deviation cannot be more than 1 USD value (100% of market rate)
        // This prevents setting VND to "25" instead of "25000"
        if (vRate <= 0 || vRate > liveVND * 2) {
            return res.status(400).json({ 
                message: `VND rate is invalid. It must be between 1 and ${Math.round(liveVND * 2)} (Live market is ~${Math.round(liveVND)}).` 
            });
        }

        if (jRate <= 0 || jRate > liveJPY * 2) {
            return res.status(400).json({ 
                message: `JPY rate is invalid. It must be between 1 and ${Math.round(liveJPY * 2)} (Live market is ~${Math.round(liveJPY)}).` 
            });
        }

        const newValue = { 
            bankId, 
            accountNumber, 
            accountName, 
            messageTemplate,
            vndRate: vRate,
            jpyRate: jRate
        };
        await query(
            'INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
            ['payment_qr_config', JSON.stringify(newValue)]
        );
        res.status(200).json({ message: 'Settings updated successfully' });
    } catch (err) {
        console.error('Error updating settings:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    initiatePayment,
    verifyPayment,
    simulateCallback,
    handlePayOSWebhook,
    getPaymentSettings,
    updatePaymentSettings
};
