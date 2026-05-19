const { query } = require('../config/db');
const NotificationController = require('../controllers/notificationController');
const GHNClient = require('../utils/ghnClient');

/**
 * Mock Delivery Service
 * This service mimics an external delivery provider like Grab or Lalamove.
 * Its architecture is designed so that the internal logic can be swapped
 * with a real API call later without affecting the rest of the system.
 */
class DeliveryService {
    /**
     * Creates the initial delivery record in 'Pending' status.
     * Called immediately when a delivery order is placed.
     */
    async initializeDelivery(orderId, fee = 0.50) {
        
        try {
            const result = await query(
                `INSERT INTO deliveries (order_id, status, delivery_fee) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (order_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP, delivery_fee = $3
                 RETURNING *`,
                [orderId, 'Pending', fee]
            );
            return result.rows[0];
        } catch (error) {
            console.error('[MockDelivery] Error initializing delivery:', error);
            throw error;
        }
    }

    /**
     * Assigns a driver and begins the delivery progress simulation.
     * Called when the order is 'Ready'.
     */
    async dispatchDelivery(orderId) {
        
        
        try {
            // 1. Fetch complete order details for GHN request
            const orderRes = await query(`
                SELECT id, customer_name, customer_phone, customer_address, district_id, ward_code, total_price 
                FROM orders WHERE id = $1
            `, [orderId]);

            if (orderRes.rows.length === 0) throw new Error('Order not found');
            const order = orderRes.rows[0];

            // 2. Fetch items for the order
            const itemsRes = await query('SELECT p.name, od.quantity, p.price FROM order_details od JOIN products p ON od.product_id = p.id WHERE od.order_id = $1', [orderId]);

            // 3. Create real GHN order
            const ghnResponse = await GHNClient.createOrder({
                to_name: order.customer_name,
                to_phone: order.customer_phone,
                to_address: order.customer_address,
                to_ward_code: order.ward_code,
                to_district_id: order.district_id,
                items: itemsRes.rows
            });

            

            // 4. Update local delivery record with GHN info
            const result = await query(
                `UPDATE deliveries 
                 SET status = $1, 
                     tracking_number = $2, 
                     estimated_time = $3,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE order_id = $4
                 RETURNING *`,
                [
                    'Assigned',
                    ghnResponse.order_code,
                    ghnResponse.expected_delivery_time,
                    orderId
                ]
            );

            if (result.rows.length === 0) {
                // Should not happen with initializeDelivery, but safety first
                return await this.createLegacyDelivery(orderId);
            }

            const delivery = result.rows[0];
            // No more simulateWorkflow - waiting for webhook or actual delivery!
            return delivery;
        } catch (error) {
            console.error('[GHN] Error dispatching delivery:', error.message);
            throw error;
        }
    }

    /**
     * Fallback for cases where a delivery record wasn't initialized at order time.
     */
    async createLegacyDelivery(orderId) {
        const trackingNumber = `BAK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const estimatedDeliveryTime = new Date();
        estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 45);

        const result = await query(
            `INSERT INTO deliveries (order_id, status, tracking_number, driver_name, driver_phone, delivery_fee, estimated_time) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             ON CONFLICT (order_id) DO UPDATE SET status = 'Assigned'
             RETURNING *`,
            [orderId, 'Assigned', trackingNumber, 'John Doe', '0912345678', 0.50, estimatedDeliveryTime]
        );
        const delivery = result.rows[0];
        this.simulateWorkflow(delivery.id);
        return delivery;
    }

    /**
     * Automatically moves the delivery through various stages to simulate progress.
     */
    simulateWorkflow(deliveryId) {
        const stages = [
            { status: 'Dispatched', delay: 10000 },  // 10 sec
            { status: 'In Transit', delay: 20000 },  // 20 sec
            { status: 'Delivered', delay: 40000 }    // 40 sec
        ];

        stages.forEach(stage => {
            setTimeout(async () => {
                await this.updateDeliveryStatus(deliveryId, stage.status);
            }, stage.delay);
        });
    }

    async updateDeliveryStatus(deliveryId, status) {
        
        const result = await query(
            'UPDATE deliveries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, deliveryId]
        );

        if (result.rows.length === 0) return null;
        const delivery = result.rows[0];

        // Fetch user_id for notification
        const orderResult = await query(
            'SELECT user_id FROM orders WHERE id = $1',
            [delivery.order_id]
        );
        const userId = orderResult.rows[0]?.user_id;

        if (status === 'Delivered') {
            await query(
                'UPDATE orders SET status = $1, completed_time = CURRENT_TIMESTAMP WHERE id = $2',
                ['Completed', delivery.order_id]
            );
        }

        // Create persistent notification
        if (userId) {
            try {
                const title = `Delivery Update: #${delivery.order_id}`;
                const message = `Your order status has been updated to: ${status}`;
                await NotificationController.createNotification(userId, title, message, 'delivery');
            } catch (notifyError) {
                console.error('[MockDelivery] Failed to create notification:', notifyError);
            }
        }

        if (global.io) {
            global.io.emit('delivery:status_updated', {
                order_id: delivery.order_id,
                delivery_id: deliveryId,
                status: status
            });
        }
        return delivery;
    }

    async getDeliveryByOrderId(orderId) {
        const result = await query('SELECT * FROM deliveries WHERE order_id = $1', [orderId]);
        return result.rows[0] || null;
    }
}

module.exports = new DeliveryService();
