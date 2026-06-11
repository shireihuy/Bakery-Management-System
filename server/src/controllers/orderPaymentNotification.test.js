describe('orderController / paymentController / notificationController', () => {
    let db;
    let controller;
    let paymentController;
    let notifications;
    let DeliveryService;
    let payos;
    let GHNClient;
    let client;

    beforeEach(() => {
        vi.resetModules();
        global.io = { emit: vi.fn(), to: vi.fn(() => ({ emit: vi.fn() })) };

        db = {
            query: vi.fn(),
            pool: {
                connect: vi.fn()
            }
        };
        client = {
            query: vi.fn(),
            release: vi.fn()
        };
        db.pool.connect.mockResolvedValue(client);

        const dbPath = require.resolve('../config/db');
        require.cache[dbPath] = { exports: db };

        delete require.cache[require.resolve('./notificationController')];
        notifications = require('./notificationController');

        DeliveryService = { initializeDelivery: vi.fn() };
        require.cache[require.resolve('../services/deliveryService')] = { exports: DeliveryService };

        payos = {
            paymentRequests: {
                create: vi.fn(),
                get: vi.fn()
            },
            webhooks: {
                verify: vi.fn()
            }
        };
        require.cache[require.resolve('../config/payos')] = { exports: payos };

        GHNClient = {
            calculateFee: vi.fn()
        };
        require.cache[require.resolve('../utils/ghnClient')] = { exports: GHNClient };

        delete require.cache[require.resolve('./orderController')];
        delete require.cache[require.resolve('./paymentController')];
        controller = require('./orderController');
        paymentController = require('./paymentController');
    });

    it('creates an order and emits stock update', async () => {
        client.query
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Bread', price: '3', stock_quantity: 10 }] }) // product
            .mockResolvedValueOnce({ rows: [{ active_stock: '10' }] }) // active stock check
            .mockResolvedValueOnce({ rows: [] }) // flash sale
            .mockResolvedValueOnce({ rows: [{ id: 10 }] }) // insert order
            .mockResolvedValueOnce({ rows: [{ id: 55 }] }) // insert order detail
            .mockResolvedValueOnce({ rows: [{ id: 100, quantity: '10' }] }) // active batches for FEFO
            .mockResolvedValueOnce({ rows: [] }) // update batch quantity
            .mockResolvedValueOnce({ rows: [] }) // save allocation
            .mockResolvedValueOnce({ rows: [] }) // sync product stock
            .mockResolvedValueOnce({}); // COMMIT
        db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

        const req = {
            user: { id: 'u1', name: 'Customer', email: 'c@example.com', role: 'Customer' },
            body: {
                items: [{ product_id: 1, quantity: 2 }],
                delivery_type: 'Pick-up'
            }
        };
        const res = mockRes();

        await controller.createOrder(req, res);

        expect(res.statusCode).toBe(201);
        expect(global.io.emit).toHaveBeenCalledWith('stock:updated', expect.objectContaining({ source: 'order' }));
    });

    it('initiates mock payment when QR is not configured', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 7, total_price: 100, transaction_id: null, qr_code: null, payment_url: null }] });
        const res = mockRes();
        await paymentController.initiatePayment({ body: { orderId: 7, method: 'cash' } }, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/Mock/);
    });

    it('creates mock payment response when QR integration is not enabled', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 8, total_price: 100, transaction_id: null, qr_code: null, payment_url: null }] });

        const res = mockRes();
        await paymentController.initiatePayment({ body: { orderId: 8, method: 'cash' } }, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/Mock/);
    });

    it('creates notification records and marks them as read', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'A' }] });
        const res1 = mockRes();
        await notifications.getNotifications({ user: { id: 'u1' } }, res1);
        expect(res1.body).toEqual([{ id: 1, title: 'A' }]);

        const res2 = mockRes();
        db.query.mockResolvedValueOnce({ rows: [] });
        await notifications.markAsRead({ params: { id: '1' }, user: { id: 'u1' } }, res2);
        expect(res2.body.message).toMatch(/read/i);

        db.query.mockResolvedValueOnce({ rows: [{ id: 2, user_id: 'u1' }] });
        await notifications.createNotification('u1', 'Title', 'Message', 'success');
        expect(global.io.to).toHaveBeenCalledWith('user_u1');
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
