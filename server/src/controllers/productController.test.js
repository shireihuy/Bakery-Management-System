const path = require('path');

describe('productController', () => {
    let db;
    let NotificationController;
    let controller;

    beforeEach(() => {
        vi.resetModules();
        global.io = { emit: vi.fn() };

        const dbPath = require.resolve('../config/db');
        db = { query: vi.fn() };
        require.cache[dbPath] = { exports: db };

        const notificationPath = require.resolve('./notificationController');
        NotificationController = { notifyAdmins: vi.fn() };
        require.cache[notificationPath] = { exports: NotificationController };

        delete require.cache[require.resolve('./productController')];
        controller = require('./productController');
    });

    it('returns mapped products with batch and flash sale data', async () => {
        db.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    name: 'Croissant',
                    category: 'Pastry',
                    price: '2.5',
                    description: 'Buttery',
                    image_url: '/img.png',
                    is_active: true,
                    stock_quantity: '10',
                    min_stock_level: '5',
                    unit: 'pcs',
                    last_restocked: '2026-05-26',
                    ingredients: '["flour"]',
                    allergens: '["gluten"]',
                    avg_rating: '4.5',
                    total_votes: '2',
                    flash_sale_price: '1.8',
                    flash_sale_stock: 3,
                    flash_sale_sold: 1,
                    flash_sale_end: '2026-05-27'
                }]
            })
            .mockResolvedValueOnce({
                rows: [{
                    id: 11,
                    product_id: 1,
                    quantity: '4',
                    expiration_date: null,
                    received_at: '2026-05-20',
                    notes: 'fresh'
                }]
            });

        const res = mockRes();
        await controller.getProducts({}, res);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].batches).toHaveLength(1);
        expect(res.body[0].activeQuantity).toBe(4);
        expect(res.body[0].totalQuantity).toBe(4);
        expect(res.body[0].flashSale.salePrice).toBe(1.8);
        expect(res.body[0].rating).toBe('4.5');
    });

    it('creates a product and initial batch when quantity is provided', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 99, name: 'Cake' }] })
            .mockResolvedValueOnce({ rows: [] });

        const req = {
            body: {
                name: 'Cake',
                category: 'Cake',
                price: 10,
                description: 'Chocolate',
                unit: 'slice',
                ingredients: '["flour"]',
                allergens: '[]',
                min_stock: 7,
                initialBatchQty: 5,
                initialExpirationDate: '2026-06-01',
                initialBatchNotes: 'First batch'
            },
            file: { path: 'https://res.cloudinary.com/demo/image/upload/bakery-products/cake.png' }
        };
        const res = mockRes();

        await controller.createProduct(req, res);

        expect(res.statusCode).toBe(201);
        expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('INSERT INTO products'), expect.any(Array));
        expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO product_batches'), expect.any(Array));
    });

    it('updates stock and notifies low-stock products', async () => {
        db.query.mockResolvedValueOnce({
            rows: [{
                id: 1,
                name: 'Bread',
                stock_quantity: 2,
                min_stock_level: 5
            }]
        });

        const res = mockRes();
        await controller.updateStock({ params: { id: '1' }, body: { quantity: 2, reset: false } }, res);

        expect(global.io.emit).toHaveBeenCalledWith('stock:updated', expect.objectContaining({ productId: '1' }));
        expect(NotificationController.notifyAdmins).toHaveBeenCalled();
        expect(res.body.stock_quantity).toBe(2);
    });

    it('rejects invalid ratings and stores valid ratings', async () => {
        const badRes = mockRes();
        await controller.submitRating({ params: { id: '1' }, body: { rating: 0 }, user: { id: 'u1' } }, badRes);
        expect(badRes.statusCode).toBe(400);

        db.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ avg_rating: '4.0', total_votes: '3' }] });

        const goodRes = mockRes();
        await controller.submitRating({ params: { id: '1' }, body: { rating: 5 }, user: { id: 'u1' } }, goodRes);

        expect(goodRes.body.rating).toBe('4.0');
        expect(global.io.emit).toHaveBeenCalledWith('product:rating_updated', expect.objectContaining({ productId: '1' }));
    });

    it('resets ratings for a product', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const res = mockRes();
        await controller.resetRatings({ params: { id: '1' } }, res);

        expect(res.body.message).toMatch(/reset/i);
        expect(global.io.emit).toHaveBeenCalledWith('product:rating_updated', expect.objectContaining({ productId: '1' }));
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
