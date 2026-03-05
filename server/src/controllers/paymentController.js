const { query } = require('../config/db');

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

        res.status(200).json({ message: 'Callback processed successfully', payment_status: nextPaymentStatus });
    } catch (err) {
        console.error('Error processing mock callback:', err);
        res.status(500).json({ message: 'Server error processing callback' });
    }
};

module.exports = {
    initiatePayment,
    verifyPayment,
    simulateCallback
};
