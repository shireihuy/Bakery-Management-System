

describe('orderController', () => {
    let orderController;
    let poolMock, clientMock, dbQueryMock;

    beforeEach(() => {
        vi.resetModules();

        dbQueryMock = vi.fn();
        clientMock = {
            query: dbQueryMock,
            release: vi.fn()
        };
        poolMock = {
            connect: vi.fn().mockResolvedValue(clientMock),
            query: dbQueryMock
        };

        const dbPath = require.resolve('../config/db');
        require.cache[dbPath] = {
            exports: { pool: poolMock, query: dbQueryMock }
        };

        // Mock dependencies
        require.cache[require.resolve('./notificationController')] = {
            exports: { createNotification: vi.fn().mockResolvedValue() }
        };
        require.cache[require.resolve('../services/deliveryService')] = {
            exports: { initializeDelivery: vi.fn(), dispatchDelivery: vi.fn() }
        };
        require.cache[require.resolve('../config/payos')] = {
            exports: { paymentRequests: { cancel: vi.fn() } }
        };
        require.cache[require.resolve('../utils/ghnClient')] = {
            exports: { calculateFee: vi.fn().mockResolvedValue({ total: 25000 }) }
        };

        delete require.cache[require.resolve('./orderController')];
        orderController = require('./orderController');
    });

    const mockRes = () => {
        const res = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };

    describe('getOrders', () => {
        it('fetches all orders with items', async () => {
            const req = {};
            const res = mockRes();

            dbQueryMock.mockResolvedValueOnce({
                rows: [{ id: 1, customer_name: 'Alice', total_price: '100.00' }]
            });
            dbQueryMock.mockResolvedValueOnce({
                rows: [{ id: 10, product_id: 2, quantity: 1, subtotal: '100.00' }]
            });

            await orderController.getOrders(req, res);

            expect(res.json).toHaveBeenCalledWith([
                { id: 1, customer_name: 'Alice', total_price: '100.00', items: [{ id: 10, product_id: 2, quantity: 1, subtotal: '100.00' }] }
            ]);
        });

        it('handles errors', async () => {
            const req = {};
            const res = mockRes();
            dbQueryMock.mockRejectedValueOnce(new Error('DB error'));
            
            await orderController.getOrders(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getMyOrders', () => {
        it('fetches orders for logged in user', async () => {
            const req = { user: { id: 'u1' } };
            const res = mockRes();

            dbQueryMock.mockResolvedValueOnce({
                rows: [{ id: 2, customer_name: 'Bob', total_price: '50.00' }]
            });
            dbQueryMock.mockResolvedValueOnce({
                rows: [{ id: 20, product_id: 3, quantity: 2, subtotal: '50.00' }]
            });

            await orderController.getMyOrders(req, res);

            expect(dbQueryMock).toHaveBeenCalledWith(expect.stringContaining('WHERE o.customer_id = $1'), ['u1']);
            expect(res.json).toHaveBeenCalledWith([
                { id: 2, customer_name: 'Bob', total_price: '50.00', items: [{ id: 20, product_id: 3, quantity: 2, subtotal: '50.00' }] }
            ]);
        });
    });

    describe('getOrderById', () => {
        it('fetches a single order by id', async () => {
            const req = { params: { id: 1 } };
            const res = mockRes();

            dbQueryMock.mockResolvedValueOnce({
                rows: [{ id: 1, customer_name: 'Charlie', total_price: '75.00' }]
            });
            dbQueryMock.mockResolvedValueOnce({
                rows: [{ id: 30, product_id: 4, quantity: 1, subtotal: '75.00' }]
            });

            await orderController.getOrderById(req, res);

            expect(res.json).toHaveBeenCalledWith({
                id: 1, customer_name: 'Charlie', total_price: '75.00', items: [{ id: 30, product_id: 4, quantity: 1, subtotal: '75.00' }]
            });
        });

        it('returns 404 if order not found', async () => {
            const req = { params: { id: 99 } };
            const res = mockRes();

            dbQueryMock.mockResolvedValueOnce({ rows: [] });

            await orderController.getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
