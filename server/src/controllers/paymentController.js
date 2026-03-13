const { query } = require('../config/db');
const NotificationController = require('./notificationController');

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

        // 2. Update order with payment method
        await query(
            'UPDATE orders SET payment_method = $1, payment_status = $2 WHERE id = $3',
            [method, 'Pending', orderId]
        );

        // 3. Return mock payment data
        // In a real app, this would return a URL to redirect the user to MoMo/ZaloPay
        res.status(200).json({
            message: 'Payment initiated',
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
            'SELECT id, status, payment_status, payment_method, total_price FROM orders WHERE id = $1',
            [orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(result.rows[0]);
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

        // Update payment status
        // If status is 'success', we also move the order to 'Baking'
        const nextOrderStatus = status === 'success' ? 'Baking' : order.status;
        const nextPaymentStatus = status === 'success' ? 'Paid' : 'Failed';

        const updateQuery = `
            UPDATE orders 
            SET payment_status = $1, 
                status = $2::varchar, 
                transaction_id = $3,
                start_time = CASE WHEN $2::varchar = 'Baking' THEN CURRENT_TIMESTAMP ELSE start_time END
            WHERE id = $4 
            RETURNING *
        `;

        await query(updateQuery, [nextPaymentStatus, nextOrderStatus, transactionId || `TX_${Date.now()}`, orderId]);

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
                    `Payment for order #${orderId} was successful. We've started baking!`,
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
    getPaymentSettings,
    updatePaymentSettings
};
