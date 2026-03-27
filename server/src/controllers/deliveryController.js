const DeliveryService = require('../services/deliveryService');
const GHNClient = require('../utils/ghnClient');

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

const getProvinces = async (req, res) => {
    try {
        const provinces = await GHNClient.getProvinces();
        res.json(provinces);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching provinces', error: error.message });
    }
};

const getDistricts = async (req, res) => {
    try {
        const districts = await GHNClient.getDistricts(parseInt(req.params.provinceId));
        res.json(districts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching districts', error: error.message });
    }
};

const getWards = async (req, res) => {
    try {
        const wards = await GHNClient.getWards(parseInt(req.params.districtId));
        res.json(wards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wards', error: error.message });
    }
};

const calculateFee = async (req, res) => {
    try {
        const { district_id, ward_code, weight } = req.query;
        if (!district_id || !ward_code) {
            return res.status(400).json({ message: 'Missing district_id or ward_code' });
        }
        
        const fee = await GHNClient.calculateFee({
            to_district_id: parseInt(district_id),
            to_ward_code: ward_code,
            weight: weight ? parseInt(weight) : 500
        });
        res.json({ fee });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating fee', error: error.message });
    }
};

module.exports = {
    getDeliveryByOrderId,
    requestDelivery,
    getProvinces,
    getDistricts,
    getWards,
    calculateFee
};
