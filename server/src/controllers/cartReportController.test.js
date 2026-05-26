describe('cartController / reportController', () => {
    let cartController;
    let reportController;
    let poolQuery;
    let dbQuery;

    beforeEach(() => {
        vi.resetModules();

        poolQuery = vi.fn();
        dbQuery = vi.fn();

        const pgPath = require.resolve('pg');
        function MockPool() {
            this.query = poolQuery;
        }
        require.cache[pgPath] = {
            exports: {
                Pool: MockPool
            }
        };

        const dbPath = require.resolve('../config/db');
        require.cache[dbPath] = {
            exports: {
                query: dbQuery
            }
        };

        delete require.cache[require.resolve('./cartController')];
        delete require.cache[require.resolve('./reportController')];
        cartController = require('./cartController');
        reportController = require('./reportController');
    });

    it('maps cart items and handles update/remove/clear flows', async () => {
        poolQuery.mockResolvedValueOnce({
            rows: [{
                cart_item_id: 9,
                product_id: 1,
                quantity: 2,
                name: 'Croissant',
                price: '2.5',
                stock: '10',
                image: '/img.png',
                category: 'Pastry',
                flash_sale_price: '1.8',
                flash_sale_stock: 3,
                flash_sale_sold: 1,
                flash_sale_end: '2026-05-27'
            }]
        });

        const res = mockRes();
        await cartController.getCart({ user: { id: 'u1' } }, res);
        expect(res.body.success).toBe(true);
        expect(res.body.cart[0].flashSale.salePrice).toBe(1.8);

        const updateRes = mockRes();
        await cartController.updateCartItem({ user: { id: 'u1' }, body: { productId: '1', quantity: 3 } }, updateRes);
        expect(updateRes.body.message).toMatch(/updated/i);

        const removeRes = mockRes();
        await cartController.removeCartItem({ user: { id: 'u1' }, params: { productId: '1' } }, removeRes);
        expect(removeRes.body.message).toMatch(/removed/i);

        const clearRes = mockRes();
        await cartController.clearCart({ user: { id: 'u1' } }, clearRes);
        expect(clearRes.body.message).toMatch(/cleared/i);
    });

    it('returns aggregated report data for weekly and all-time ranges', async () => {
        dbQuery
            .mockResolvedValueOnce({ rows: [{ date: 'Mon', revenue: '100', orders: 2 }] })
            .mockResolvedValueOnce({ rows: [{ name: 'Cake', sales: '4', revenue: '80', trend: 'stable' }] })
            .mockResolvedValueOnce({ rows: [{ total: '100' }] })
            .mockResolvedValueOnce({ rows: [{ name: 'Dessert', revenue: '80' }] });

        const weeklyRes = mockRes();
        await reportController.getReportData({ query: { range: '7days' } }, weeklyRes);
        expect(weeklyRes.body.dailyHistory).toHaveLength(1);
        expect(weeklyRes.body.productPerformance[0].name).toBe('Cake');
        expect(weeklyRes.body.categoryDistribution[0].name).toBe('Dessert');

        dbQuery
            .mockResolvedValueOnce({ rows: [{ date: '05/2026', revenue: '300', orders: 5 }] })
            .mockResolvedValueOnce({ rows: [{ name: 'Bread', sales: '10', revenue: '200', trend: 'stable' }] })
            .mockResolvedValueOnce({ rows: [{ total: '300' }] })
            .mockResolvedValueOnce({ rows: [{ name: 'Bakery', revenue: '200' }] });

        const allRes = mockRes();
        await reportController.getReportData({ query: { range: 'all' } }, allRes);
        expect(allRes.body.dailyHistory[0].date).toBe('05/2026');
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
