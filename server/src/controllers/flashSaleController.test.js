describe('flashSaleController', () => {
    let db;
    let controller;
    let client;

    beforeEach(() => {
        vi.resetModules();
        global.io = { emit: vi.fn() };

        client = {
            query: vi.fn(),
            release: vi.fn()
        };

        db = {
            query: vi.fn(),
            pool: {
                connect: vi.fn().mockResolvedValue(client)
            }
        };

        require.cache[require.resolve('../config/db')] = { exports: db };
        delete require.cache[require.resolve('./flashSaleController')];
        controller = require('./flashSaleController');
    });

    it('returns flash sales and active flash sales', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Winter Sale', items: [] }] })
            .mockResolvedValueOnce({ rows: [{ id: 2, name: 'Hot Sale', items: [] }] });

        const res1 = mockRes();
        await controller.getFlashSales({}, res1);
        expect(res1.body[0].name).toBe('Winter Sale');

        const res2 = mockRes();
        await controller.getActiveFlashSales({}, res2);
        expect(res2.body[0].name).toBe('Hot Sale');
    });

    it('rejects invalid flash sale times', async () => {
        const res = mockRes();
        await controller.createFlashSale({
            body: {
                name: 'Bad Sale',
                start_time: '2026-06-02T10:00:00Z',
                end_time: '2026-06-01T10:00:00Z',
                items: []
            }
        }, res);

        expect(res.statusCode).toBe(400);
    });

    it('creates a flash sale and emits an event', async () => {
        client.query
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 10, name: 'Summer Sale' }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = mockRes();
        await controller.createFlashSale({
            body: {
                name: 'Summer Sale',
                start_time: '2026-06-01T10:00:00Z',
                end_time: '2026-06-02T10:00:00Z',
                items: [
                    { product_id: 1, sale_price: 2.5, flash_sale_stock: 10 }
                ]
            }
        }, res);

        expect(res.statusCode).toBe(201);
        expect(global.io.emit).toHaveBeenCalledWith('flash_sale:created', expect.objectContaining({ id: 10 }));
    });

    it('toggles, updates, and deletes flash sales', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 3, is_active: false }] })
            .mockResolvedValueOnce({ rows: [{ id: 5 }] });

        const toggleRes = mockRes();
        await controller.toggleFlashSale({ params: { id: '3' }, body: { is_active: false } }, toggleRes);
        expect(toggleRes.body.id).toBe(3);

        client.query
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ rows: [{ id: 4, items: [{ id: 1 }] }] });

        const updateRes = mockRes();
        await controller.updateFlashSale({
            params: { id: '4' },
            body: {
                name: 'Updated Sale',
                start_time: '2026-06-03T10:00:00Z',
                end_time: '2026-06-04T10:00:00Z',
                items: [{ product_id: 2, sale_price: 3, flash_sale_stock: 5, sold_quantity: 1 }],
                is_active: true
            }
        }, updateRes);
        expect(updateRes.body.id).toBe(4);

        const deleteRes = mockRes();
        await controller.deleteFlashSale({ params: { id: '5' } }, deleteRes);
        expect(deleteRes.body.message).toMatch(/deleted/i);
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
