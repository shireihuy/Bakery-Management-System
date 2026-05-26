describe('deliveryService', () => {
    let db;
    let notifications;
    let ghn;
    let service;

    beforeEach(() => {
        vi.resetModules();
        global.io = { emit: vi.fn() };
        vi.spyOn(global, 'setTimeout').mockImplementation(() => 1);

        db = { query: vi.fn() };
        notifications = { createNotification: vi.fn() };
        ghn = { createOrder: vi.fn() };

        require.cache[require.resolve('../config/db')] = { exports: db };
        require.cache[require.resolve('../controllers/notificationController')] = { exports: notifications };
        require.cache[require.resolve('../utils/ghnClient')] = { exports: ghn };

        delete require.cache[require.resolve('./deliveryService')];
        service = require('./deliveryService');
        vi.spyOn(service, 'simulateWorkflow').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('initializes a pending delivery and reads by order id', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 1, order_id: 10, status: 'Pending' }] })
            .mockResolvedValueOnce({ rows: [{ id: 1, order_id: 10, status: 'Pending' }] });

        const init = await service.initializeDelivery(10, 1.5);
        expect(init.status).toBe('Pending');

        const found = await service.getDeliveryByOrderId(10);
        expect(found.id).toBe(1);
    });

    it('dispatches delivery and falls back when update returns no rows', async () => {
        db.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 5,
                    customer_name: 'Alice',
                    customer_phone: '0900',
                    customer_address: 'Street',
                    district_id: 2,
                    ward_code: '001',
                    total_price: 100
                }]
            })
            .mockResolvedValueOnce({ rows: [{ name: 'Cake', quantity: 1, price: 10 }] })
            .mockResolvedValueOnce({
                rows: [{
                    id: 99,
                    order_id: 5,
                    status: 'Pending'
                }]
            });

        ghn.createOrder.mockResolvedValueOnce({
            order_code: 'GHN-1',
            expected_delivery_time: '2026-06-01T10:00:00Z'
        });

        const result = await service.dispatchDelivery(5);
        expect(result.id).toBe(99);
        expect(notifications.createNotification).not.toHaveBeenCalled();
    });

    it('updates delivery status and creates completion notification', async () => {
        db.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 7,
                    order_id: 11,
                    status: 'Delivered',
                    driver_name: null,
                    driver_phone: null
                }]
            })
            .mockResolvedValueOnce({ rows: [{ customer_id: 'u1' }] })
            .mockResolvedValueOnce({ rows: [] });

        const delivery = await service.updateDeliveryStatus(7, 'Delivered');
        expect(delivery.status).toBe('Delivered');
        expect(global.io.emit).toHaveBeenCalledWith('order:status_updated', expect.any(Object));
        expect(global.io.emit).toHaveBeenCalledWith('delivery:status_updated', expect.any(Object));
        expect(notifications.createNotification).toHaveBeenCalled();
    });

    it('detects simulation settings and stage plans', () => {
        process.env.DELIVERY_SIMULATION_MODE = 'false';
        expect(service.getSimulationEnabled()).toBe(false);

        process.env.DELIVERY_SIMULATION_SPEED = 'fast';
        expect(service.getStagePlan()[0].delay).toBe(2000);
    });
});
