describe('couponController', () => {
    let couponController;
    let dbQuery;

    beforeEach(() => {
        vi.resetModules();
        dbQuery = vi.fn();

        const dbPath = require.resolve('../config/db');
        require.cache[dbPath] = {
            exports: { query: dbQuery }
        };

        delete require.cache[require.resolve('./couponController')];
        couponController = require('./couponController');
    });

    const mockRes = () => {
        const res = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };

    describe('getAllCoupons', () => {
        it('fetches all coupons', async () => {
            const res = mockRes();
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 1, code: 'SAVE10' }] });
            await couponController.getAllCoupons({}, res);
            expect(res.json).toHaveBeenCalledWith([{ id: 1, code: 'SAVE10' }]);
        });

        it('handles errors', async () => {
            const res = mockRes();
            dbQuery.mockRejectedValueOnce(new Error('DB Error'));
            await couponController.getAllCoupons({}, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('createCoupon', () => {
        it('creates a new coupon', async () => {
            const res = mockRes();
            const req = { body: { code: 'NEW10', discount_type: 'percentage', discount_value: 10, min_purchase_amount: 50, usage_limit: 100, start_date: null, end_date: null, is_active: true } };
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 2, code: 'NEW10' }] });
            
            await couponController.createCoupon(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 2, code: 'NEW10' });
        });

        it('normalizes empty dates and whole-number values before creating', async () => {
            const res = mockRes();
            const req = { body: { code: ' new10 ', discount_type: 'fixed', discount_value: '2', min_purchase_amount: '10', usage_limit: '', start_date: '', end_date: '', is_active: true } };
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 2, code: 'NEW10' }] });

            await couponController.createCoupon(req, res);

            expect(dbQuery.mock.calls[0][1]).toEqual(['NEW10', 'fixed', 2, 10, null, null, null, true]);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('returns 400 for decimal coupon amounts', async () => {
            const res = mockRes();
            const req = { body: { code: 'NEW10', discount_type: 'fixed', discount_value: '2.50', min_purchase_amount: '10.75' } };

            await couponController.createCoupon(req, res);

            expect(dbQuery).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Coupon amounts must be whole numbers' });
        });

        it('returns 409 for duplicate coupon code', async () => {
            const res = mockRes();
            const req = { body: { code: 'NEW10', discount_type: 'percentage', discount_value: 10, min_purchase_amount: 50 } };
            dbQuery.mockRejectedValueOnce({ code: '23505', constraint: 'coupons_code_key' });

            await couponController.createCoupon(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'Coupon code already exists' });
        });
    });

    describe('updateCoupon', () => {
        it('updates an existing coupon', async () => {
            const res = mockRes();
            const req = { params: { id: 1 }, body: { code: 'UPDATE10', discount_type: 'fixed', discount_value: 10, min_purchase_amount: 50, usage_limit: 100, start_date: null, end_date: null, is_active: true } };
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 1, code: 'UPDATE10' }] });

            await couponController.updateCoupon(req, res);
            expect(res.json).toHaveBeenCalledWith({ id: 1, code: 'UPDATE10' });
        });

        it('returns 404 if coupon not found', async () => {
            const res = mockRes();
            const req = { params: { id: 99 }, body: {} };
            dbQuery.mockResolvedValueOnce({ rows: [] });

            await couponController.updateCoupon(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteCoupon', () => {
        it('deletes a coupon successfully', async () => {
            const res = mockRes();
            const req = { params: { id: 1 } };
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            await couponController.deleteCoupon(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'Coupon deleted successfully' });
        });

        it('returns 404 if coupon not found', async () => {
            const res = mockRes();
            const req = { params: { id: 99 } };
            dbQuery.mockResolvedValueOnce({ rows: [] });

            await couponController.deleteCoupon(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('validateCoupon', () => {
        it('returns 404 for invalid code', async () => {
            const res = mockRes();
            const req = { body: { code: 'INVALID', cartSubtotal: 100 } };
            dbQuery.mockResolvedValueOnce({ rows: [] });

            await couponController.validateCoupon(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ valid: false, message: 'Invalid coupon code' });
        });

        it('returns 400 for inactive coupon', async () => {
            const res = mockRes();
            const req = { body: { code: 'INACTIVE', cartSubtotal: 100 } };
            dbQuery.mockResolvedValueOnce({ rows: [{ is_active: false }] });

            await couponController.validateCoupon(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Coupon is not active' }));
        });

        it('calculates fixed discount successfully', async () => {
            const res = mockRes();
            const req = { body: { code: 'FIXED10', cartSubtotal: 100 } };
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 1, is_active: true, discount_type: 'fixed', discount_value: 10, min_purchase_amount: 50, usage_count: 0 }] });

            await couponController.validateCoupon(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ valid: true, discount_amount: '10.00' }));
        });

        it('calculates percentage discount successfully', async () => {
            const res = mockRes();
            const req = { body: { code: 'PERCENT10', cartSubtotal: 100 } };
            dbQuery.mockResolvedValueOnce({ rows: [{ id: 2, is_active: true, discount_type: 'percentage', discount_value: 10, min_purchase_amount: 50, usage_count: 0 }] });

            await couponController.validateCoupon(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ valid: true, discount_amount: '10.00' }));
        });
    });
});
