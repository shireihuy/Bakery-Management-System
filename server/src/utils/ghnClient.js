const fetch = require('node-fetch');

/**
 * GHN (Giao Hàng Nhanh) API Client
 * This utility handles communication with GHN's Staging/Production environments.
 */
class GHNClient {
    constructor() {
        this.token = process.env.GHN_TOKEN;
        this.shopId = parseInt(process.env.GHN_SHOP_ID);
        this.baseUrl = process.env.GHN_BASE_URL || 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/';
    }

    /**
     * Common request helper
     */
    async _request(endpoint, body, method = 'POST') {
        const url = this.baseUrl.endsWith('/') ? `${this.baseUrl}${endpoint}` : `${this.baseUrl}/${endpoint}`;
        console.log(`[GHN Request] ${method} ${url}`, body ? JSON.stringify(body) : 'No body');
        
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Token': this.token,
                    ...(this.shopId ? { 'ShopId': this.shopId.toString() } : {})
                },
                body: body ? JSON.stringify(body) : undefined
            });

            const data = await response.json();
            
            if (data.code !== 200 && data.code !== 201) {
                console.error(`[GHN Error] ${endpoint} (Code: ${data.code}):`, data.message);
                throw new Error(data.message || `GHN API Error ${data.code}`);
            }
            
            return data.data;
        } catch (error) {
            console.error(`[GHN Exception] ${endpoint}:`, error.message);
            throw error;
        }
    }

    /**
     * Fetch all provinces
     */
    async getProvinces() {
        return this._request('../master-data/province', null, 'GET');
    }

    /**
     * Fetch all districts for a province
     */
    async getDistricts(provinceId) {
        return this._request('../master-data/district', { province_id: provinceId }, 'POST');
    }

    /**
     * Fetch all wards for a district
     */
    async getWards(districtId) {
        return this._request('../master-data/ward', { district_id: districtId }, 'POST');
    }

    /**
     * Calculate Shipping Fee
     * @param {Object} params - to_district_id, to_ward_code, weight (grams), etc.
     */
    async calculateFee({ from_district_id = 1454, to_district_id, to_ward_code, weight = 500, length = 10, width = 10, height = 10 }) {
        // Find available services first (standard, fast, etc.)
        console.log(`[GHN] Fetching services for district: ${to_district_id}`);
        const services = await this._request('shipping-order/available-services', {
            shop_id: this.shopId,
            from_district: from_district_id,
            to_district: to_district_id
        });
        
        console.log(`[GHN] Available services found: ${services.length}`);

        if (services.length === 0) throw new Error('No shipping services available for this route');
        
        const serviceId = services[0].service_id;
        console.log(`[GHN] Selected service_id: ${serviceId}. Requesting final fee...`);

        return this._request('shipping-order/fee', {
            service_id: serviceId,
            insurance_value: 0,
            to_district_id,
            to_ward_code,
            weight,
            length,
            width,
            height
        });
    }

    /**
     * Create a Shipping Order
     * @param {Object} orderData - to_name, to_phone, to_address, to_ward_code, to_district_id, weight, items[]
     */
    async createOrder(orderData) {
        const payload = {
            payment_type_id: 2, // 2: Recipient pays (you can change this to 1 for Shop pays)
            note: orderData.note || 'Bakery delivery',
            required_note: 'CHOXEMHANGKHONGTHU',
            to_name: orderData.to_name,
            to_phone: orderData.to_phone,
            to_address: orderData.to_address,
            to_ward_code: orderData.to_ward_code,
            to_district_id: orderData.to_district_id,
            weight: orderData.weight || 500,
            length: 10,
            width: 10,
            height: 10,
            service_id: orderData.service_id || 53320, // Default to Standard service
            items: orderData.items.map(item => ({
                name: item.name,
                code: item.code || item.id?.toString(),
                quantity: item.quantity,
                price: Math.round(Number(item.price))
            }))
        };

        return this._request('shipping-order/create', payload);
    }
}

module.exports = new GHNClient();
