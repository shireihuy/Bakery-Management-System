describe('systemController', () => {
    let db;
    let controller;

    beforeEach(() => {
        vi.resetModules();

        db = {
            query: vi.fn()
        };

        require.cache[require.resolve('../config/db')] = { exports: db };
        delete require.cache[require.resolve('./systemController')];
        controller = require('./systemController');
    });

    it('returns all system settings as a key-value object', async () => {
        db.query.mockResolvedValueOnce({
            rows: [
                { key: 'payment_qr_config', value: { bankId: '123' } },
                { key: 'store_location_config', value: { district_id: 1454 } }
            ]
        });

        const res = mockRes();
        await controller.getSystemSettings({}, res);

        expect(res.body).toEqual({
            payment_qr_config: { bankId: '123' },
            store_location_config: { district_id: 1454 }
        });
    });

    it('updates a system setting with JSON stringified value', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });

        const res = mockRes();
        await controller.updateSystemSettings({
            body: {
                key: 'payment_qr_config',
                value: { bankId: '123', accountName: 'Bakery' }
            }
        }, res);

        expect(db.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO system_settings'),
            ['payment_qr_config', JSON.stringify({ bankId: '123', accountName: 'Bakery' })]
        );
        expect(res.body.message).toMatch(/updated/i);
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
