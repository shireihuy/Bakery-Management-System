describe('batchController', () => {
    let batchController;
    let dbQuery;
    let notifyAdminsMock;

    beforeEach(() => {
        vi.resetModules();
        dbQuery = vi.fn();
        notifyAdminsMock = vi.fn().mockResolvedValue();

        const dbPath = require.resolve('../config/db');
        require.cache[dbPath] = {
            exports: { query: dbQuery }
        };

        const notificationPath = require.resolve('./notificationController');
        require.cache[notificationPath] = {
            exports: { notifyAdmins: notifyAdminsMock }
        };

        delete require.cache[require.resolve('./batchController')];
        batchController = require('./batchController');

        global.io = { emit: vi.fn() };
    });

    afterEach(() => {
        delete global.io;
    });

    const mockRes = () => {
        const res = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };

    describe('getBatches', () => {
        it('fetches batches for a product successfully', async () => {
            const req = { params: { id: 1 } };
            const res = mockRes();
            dbQuery.mockResolvedValueOnce({
                rows: [
                    { id: 1, product_id: 1, quantity: '10.5', expiration_date: '2023-12-01', received_at: '2023-01-01', notes: null }
                ]
            });

            await batchController.getBatches(req, res);

            expect(res.json).toHaveBeenCalledWith([{
                id: 1, productId: 1, quantity: 10.5, expirationDate: '2023-12-01', receivedAt: '2023-01-01', notes: null
            }]);
        });

        it('handles errors', async () => {
            const req = { params: { id: 1 } };
            const res = mockRes();
            dbQuery.mockRejectedValueOnce(new Error('DB Error'));

            await batchController.getBatches(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('addBatch', () => {
        it('returns 400 for invalid quantity', async () => {
            const req = { params: { id: 1 }, body: { quantity: -5 } };
            const res = mockRes();
            await batchController.addBatch(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('returns 400 for decimal quantity', async () => {
            const req = { params: { id: 1 }, body: { quantity: 1.5 } };
            const res = mockRes();
            await batchController.addBatch(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Quantity must be a whole number greater than 0' });
        });

        it('returns 404 if product not found', async () => {
            const req = { params: { id: 1 }, body: { quantity: 10 } };
            const res = mockRes();
            dbQuery.mockResolvedValueOnce({ rows: [] }); // productCheck

            await batchController.addBatch(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('adds a batch and triggers low stock notification if active stock is still low', async () => {
            const req = { params: { id: 1 }, body: { quantity: 5, expirationDate: '2023-12-01', notes: 'test' } };
            const res = mockRes();
            
            // productCheck
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Bread', min_stock_level: 10, stock_quantity: 0 }] });
            // insert batch
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 1, product_id: 1, quantity: '5', expiration_date: '2023-12-01', received_at: '2023-01-01', notes: 'test' }] });
            // sync product stock
            dbQuery.mockResolvedValueOnce({});
            // get active stock snapshot
            dbQuery.mockResolvedValueOnce({ rows: [{ active_stock: 5, min_stock_level: 10, name: 'Bread' }] });

            await batchController.addBatch(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(notifyAdminsMock).toHaveBeenCalled();
            expect(global.io.emit).toHaveBeenCalledWith('stock:updated', { productId: 1, newStock: 5 });
        });

        it('does not trigger low stock notification when active stock is above the alert level', async () => {
            const req = { params: { id: 1 }, body: { quantity: 12, expirationDate: '', notes: 'fresh' } };
            const res = mockRes();

            dbQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Bread', min_stock_level: 5, stock_quantity: 0 }] });
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 1, product_id: 1, quantity: '12', expiration_date: null, received_at: '2023-01-01', notes: 'fresh' }] });
            dbQuery.mockResolvedValueOnce({});
            dbQuery.mockResolvedValueOnce({ rows: [{ active_stock: 12, min_stock_level: 5, name: 'Bread' }] });

            await batchController.addBatch(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(notifyAdminsMock).not.toHaveBeenCalled();
            expect(global.io.emit).toHaveBeenCalledWith('stock:updated', { productId: 1, newStock: 12 });
        });
    });

    describe('deleteBatch', () => {
        it('returns 404 if batch not found', async () => {
            const req = { params: { id: 1, batchId: 99 } };
            const res = mockRes();
            dbQuery.mockResolvedValueOnce({ rows: [] });

            await batchController.deleteBatch(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('deletes a batch successfully', async () => {
            const req = { params: { id: 1, batchId: 1 } };
            const res = mockRes();
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // delete
            dbQuery.mockResolvedValueOnce({}); // sync
            dbQuery.mockResolvedValueOnce({ rows: [{ active_stock: 10 }] }); // active stock after sync

            await batchController.deleteBatch(req, res);

            expect(global.io.emit).toHaveBeenCalledWith('stock:updated', { productId: 1, newStock: 10 });
            expect(res.json).toHaveBeenCalledWith({ message: 'Batch deleted successfully' });
        });
    });
});
