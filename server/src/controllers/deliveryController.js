const DeliveryService = require('../services/deliveryService');

const getDeliveryByOrderId = async (req, res) => {
    const { orderId } = req.params;
    try {
        const delivery = await DeliveryService.getDeliveryByOrderId(orderId);
        if (!delivery) {
            return res.status(404).json({ message: 'No delivery found for this order' });
        }
        res.json(delivery);
    } catch (error) {
        console.error('Error fetching delivery:', error);
        res.status(500).json({ message: 'Internal server error while fetching delivery' });
    }
};

/**
 * Manually trigger a delivery request for an order
 * In a real-world scenario, this might be triggered when the order status is "Ready"
 */
const requestDelivery = async (req, res) => {
    const { orderId } = req.params;
    try {
        // Find existing delivery for this order
        const existingDelivery = await DeliveryService.getDeliveryByOrderId(orderId);
        if (existingDelivery) {
            return res.status(400).json({ message: 'Delivery already requested for this order', delivery: existingDelivery });
        }

        const delivery = await DeliveryService.createDelivery(orderId, req.body);
        res.status(201).json({ message: 'Delivery dispatch request sent successfully', delivery });
    } catch (error) {
        console.error('Error requesting delivery:', error);
        res.status(500).json({ message: 'Failed to request delivery', error: error.message });
    }
};

module.exports = {
    getDeliveryByOrderId,
    requestDelivery
};
