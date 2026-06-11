describe('paymentController', () => {
    let db;
    let notifications;
    let payos;
    let DeliveryService;
    let controller;

    beforeEach(() => {
        vi.resetModules();
        vi.useRealTimers();
        global.io = { emit: vi.fn() };
        global.fetch = vi.fn().mockResolvedValue({
            json: async () => ({ rates: { VND: 25000, JPY: 150 } })
        });

        db = { query: vi.fn() };
        notifications = { createNotification: vi.fn() };
        payos = {
            paymentRequests: {
                create: vi.fn(),
                get: vi.fn()
            },
            webhooks: {
                verify: vi.fn()
            }
        };
        DeliveryService = {
            dispatchDelivery: vi.fn()
        };

        require.cache[require.resolve('../config/db')] = { exports: db };
        require.cache[require.resolve('./notificationController')] = { exports: notifications };
        require.cache[require.resolve('../config/payos')] = { exports: payos };
        require.cache[require.resolve('../services/deliveryService')] = { exports: DeliveryService };

        delete require.cache[require.resolve('./paymentController')];
        controller = require('./paymentController');
    });

    it('returns mock payment when QR is not configured', async () => {
        db.query.mockResolvedValueOnce({
            rows: [{ id: 1, total_price: 100, transaction_id: null, qr_code: null, payment_url: null }]
        });

        const res = mockRes();
        await controller.initiatePayment({ body: { orderId: 1, method: 'cash' } }, res);

        expect(res.body.message).toMatch(/Mock/);
    });

    it('rejects payment initiation for cancelled orders', async () => {
        db.query.mockResolvedValueOnce({
            rows: [{ id: 10, status: 'Cancelled', payment_status: 'Cancelled', total_price: 100 }]
        });

        const res = mockRes();
        await controller.initiatePayment({ body: { orderId: 10, method: 'qr' } }, res);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Cancelled orders cannot be paid');
    });

    it('reuses existing PayOS link when available', async () => {
        process.env.PAYOS_CLIENT_ID = 'real-client';
        db.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 2,
                    total_price: 120,
                    transaction_id: 'plink-1',
                    qr_code: 'qr-1',
                    payment_url: 'https://old-link'
                }]
            })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ value: { accountName: 'Bakery', vndRate: 25000 } }] });

        const res = mockRes();
        await controller.initiatePayment({ body: { orderId: 2, method: 'qr' } }, res);

        expect(res.body.message).toBe('PayOS link reused');
        expect(res.body.paymentUrl).toBe('https://old-link');
    });

    it('creates a new PayOS payment link for QR', async () => {
        process.env.PAYOS_CLIENT_ID = 'real-client';
        db.query
            .mockResolvedValueOnce({
                rows: [{ id: 3, total_price: 100, transaction_id: null, qr_code: null, payment_url: null }]
            })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ value: { accountName: 'Bakery', vndRate: 25000 } }] })
            .mockResolvedValueOnce({ rows: [] });

        payos.paymentRequests.create.mockResolvedValueOnce({
            paymentLinkId: 'plink-3',
            checkoutUrl: 'https://pay.os/checkout',
            qrCode: 'qr-code',
            bin: 'bin',
            accountNumber: '123',
            amount: 2500000,
            description: 'Bakery Payment #3',
            accountName: 'Bakery'
        });

        const res = mockRes();
        await controller.initiatePayment({ body: { orderId: 3, method: 'qr' } }, res);

        expect(payos.paymentRequests.create).toHaveBeenCalled();
        expect(res.body.message).toBe('PayOS link created');
    });

    it('verifies payment and updates paid order', async () => {
        vi.useFakeTimers();
        db.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 4,
                    status: 'Pending',
                    payment_status: 'Pending',
                    payment_method: 'qr',
                    transaction_id: null,
                    payment_url: null,
                    qr_code: null,
                    total_price: 200,
                    customer_id: 'u1',
                    delivery_type: 'Delivery'
                }]
            })
            .mockResolvedValueOnce({
                rows: [{
                    id: 4,
                    status: 'Ready',
                    payment_status: 'Paid',
                    payment_method: 'qr',
                    transaction_id: 'payos-1',
                    payment_url: null,
                    qr_code: null,
                    total_price: 200,
                    customer_id: 'u1',
                    delivery_type: 'Delivery'
                }]
            })
            .mockResolvedValueOnce({ rows: [] });

        payos.paymentRequests.get.mockResolvedValueOnce({ status: 'PAID', id: 'payos-1' });

        const res = mockRes();
        await controller.verifyPayment({ params: { orderId: '4' } }, res);

        expect(global.io.emit).toHaveBeenCalledWith('order_paid', { orderId: '4' });
        expect(notifications.createNotification).toHaveBeenCalled();
        expect(res.body.status).toBe('Ready');

        await vi.advanceTimersByTimeAsync(30000);
        expect(DeliveryService.dispatchDelivery).toHaveBeenCalledWith(4);
    });

    it('processes success callback and webhook success path', async () => {
        vi.useFakeTimers();
        db.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 5,
                    status: 'Pending',
                    payment_method: 'qr',
                    total_price: 300,
                    customer_id: 'u2',
                    delivery_type: 'Delivery'
                }]
            })
            .mockResolvedValueOnce({ rows: [{ id: 5, status: 'Ready', payment_status: 'Paid' }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({
                rows: [{
                    id: 6,
                    status: 'Ready',
                    payment_status: 'Paid',
                    total_price: 400,
                    delivery_type: 'Delivery'
                }]
            })
            .mockResolvedValueOnce({ rows: [] });

        const callbackRes = mockRes();
        await controller.simulateCallback({ body: { orderId: 5, status: 'success', transactionId: 'tx-5' } }, callbackRes);
        expect(callbackRes.body.payment_status).toBe('Paid');

        payos.webhooks.verify.mockReturnValueOnce({
            desc: 'success',
            orderCode: '6',
            paymentLinkId: 'plink-6'
        });

        const webhookRes = mockRes();
        await controller.handlePayOSWebhook({ body: { any: 'payload' } }, webhookRes);
        expect(webhookRes.body.success).toBe(true);

        await vi.advanceTimersByTimeAsync(30000);
        expect(DeliveryService.dispatchDelivery).toHaveBeenCalledWith(5);
        expect(DeliveryService.dispatchDelivery).toHaveBeenCalledWith(6);
    });

    it('rejects simulated payment callback for cancelled orders', async () => {
        db.query.mockResolvedValueOnce({
            rows: [{ id: 11, status: 'Cancelled', payment_status: 'Cancelled', total_price: 100 }]
        });

        const res = mockRes();
        await controller.simulateCallback({ body: { orderId: 11, status: 'success', transactionId: 'tx-11' } }, res);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Cancelled orders cannot be paid');
    });

    it('returns and updates payment settings', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ value: { accountName: 'Bakery' } }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const getRes = mockRes();
        await controller.getPaymentSettings({}, getRes);
        expect(getRes.body.accountName).toBe('Bakery');

        db.query.mockReset();
        db.query
            .mockResolvedValueOnce({ rows: [{ updated_at: new Date().toISOString() }] })
            .mockResolvedValueOnce({ rows: [{ value: { rate: 25000 } }] })
            .mockResolvedValueOnce({ rows: [{ updated_at: new Date().toISOString() }] })
            .mockResolvedValueOnce({ rows: [{ value: { rate: 150 } }] })
            .mockResolvedValueOnce({ rows: [] });

        const updateRes = mockRes();
        await controller.updatePaymentSettings({
            body: {
                bankId: '123',
                accountNumber: '456',
                accountName: 'Bakery',
                messageTemplate: 'Payment #{{orderId}}',
                vndRate: '25000',
                jpyRate: '150'
            }
        }, updateRes);
        expect(updateRes.body.message).toMatch(/updated/i);
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
