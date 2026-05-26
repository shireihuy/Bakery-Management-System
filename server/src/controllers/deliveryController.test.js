describe('deliveryController', () => {
    let controller;
    let DeliveryService;
    let GHNClient;

    beforeEach(() => {
        vi.resetModules();

        DeliveryService = {
            getDeliveryByOrderId: vi.fn(),
            dispatchDelivery: vi.fn(),
            initializeDelivery: vi.fn()
        };
        GHNClient = {
            getProvinces: vi.fn(),
            getDistricts: vi.fn(),
            getWards: vi.fn(),
            calculateFee: vi.fn()
        };

        require.cache[require.resolve('../services/deliveryService')] = { exports: DeliveryService };
        require.cache[require.resolve('../utils/ghnClient')] = { exports: GHNClient };

        delete require.cache[require.resolve('./deliveryController')];
        controller = require('./deliveryController');
    });

    it('returns delivery by order id and handles not found', async () => {
        DeliveryService.getDeliveryByOrderId.mockResolvedValueOnce({ id: 1, order_id: '10' });
        const okRes = mockRes();
        await controller.getDeliveryByOrderId({ params: { orderId: '10' } }, okRes);
        expect(okRes.body.id).toBe(1);

        DeliveryService.getDeliveryByOrderId.mockResolvedValueOnce(null);
        const nfRes = mockRes();
        await controller.getDeliveryByOrderId({ params: { orderId: '11' } }, nfRes);
        expect(nfRes.statusCode).toBe(404);
    });

    it('requests delivery for existing and new orders', async () => {
        DeliveryService.getDeliveryByOrderId.mockResolvedValueOnce({ status: 'Pending' });
        DeliveryService.dispatchDelivery.mockResolvedValueOnce({ id: 2, status: 'Searching' });
        const existingRes = mockRes();
        await controller.requestDelivery({ params: { orderId: '1' } }, existingRes);
        expect(existingRes.statusCode).toBe(200);
        expect(DeliveryService.dispatchDelivery).toHaveBeenCalledWith('1');

        DeliveryService.getDeliveryByOrderId.mockResolvedValueOnce(null);
        DeliveryService.initializeDelivery.mockResolvedValueOnce({ id: 3 });
        DeliveryService.dispatchDelivery.mockResolvedValueOnce({ id: 3, status: 'Searching' });
        const newRes = mockRes();
        await controller.requestDelivery({ params: { orderId: '2' }, body: { delivery_fee: 1.2 } }, newRes);
        expect(newRes.statusCode).toBe(201);
        expect(DeliveryService.initializeDelivery).toHaveBeenCalledWith('2', 1.2);
    });

    it('returns location data from GHN client', async () => {
        GHNClient.getProvinces.mockResolvedValueOnce([{ id: 1 }]);
        GHNClient.getDistricts.mockResolvedValueOnce([{ id: 2 }]);
        GHNClient.getWards.mockResolvedValueOnce([{ id: 3 }]);

        const provincesRes = mockRes();
        await controller.getProvinces({}, provincesRes);
        expect(provincesRes.body).toEqual([{ id: 1 }]);

        const districtsRes = mockRes();
        await controller.getDistricts({ params: { provinceId: '5' } }, districtsRes);
        expect(GHNClient.getDistricts).toHaveBeenCalledWith(5);
        expect(districtsRes.body).toEqual([{ id: 2 }]);

        const wardsRes = mockRes();
        await controller.getWards({ params: { districtId: '9' } }, wardsRes);
        expect(GHNClient.getWards).toHaveBeenCalledWith(9);
        expect(wardsRes.body).toEqual([{ id: 3 }]);
    });

    it('calculates delivery fee and validates required fields', async () => {
        const badRes = mockRes();
        await controller.calculateFee({ query: {} }, badRes);
        expect(badRes.statusCode).toBe(400);

        const dbPath = require.resolve('../config/db');
        require.cache[dbPath] = {
            exports: {
                query: vi.fn().mockResolvedValue({ rows: [{ value: { district_id: 1454 } }] })
            }
        };
        GHNClient.calculateFee.mockResolvedValueOnce({ total: 25000 });

        const goodRes = mockRes();
        await controller.calculateFee({ query: { district_id: '2', ward_code: '001', weight: '700' } }, goodRes);
        expect(GHNClient.calculateFee).toHaveBeenCalled();
        expect(goodRes.body.fee).toEqual({ total: 25000 });
    });
});

function mockRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}
