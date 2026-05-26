describe('userController', () => {
    let db;
    let controller;

    beforeEach(() => {
        vi.resetModules();

        db = {
            query: vi.fn()
        };

        require.cache[require.resolve('../config/db')] = { exports: db };
        delete require.cache[require.resolve('./userController')];
        controller = require('./userController');
    });

    const mockRes = () => {
        const res = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };

    describe('updateProfile', () => {
        it('updates profile and normalizes optional fields', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, name: 'Alice', email: 'alice@example.com' }]
            });

            const res = mockRes();
            await controller.updateProfile({
                user: { id: 1 },
                body: { name: 'Alice', email: 'ALICE@EXAMPLE.COM', phone: '', address: '' }
            }, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ email: 'alice@example.com' }));
        });

        it('returns 404 if user not found', async () => {
            db.query.mockResolvedValueOnce({ rows: [] });
            const res = mockRes();
            await controller.updateProfile({ user: { id: 99 }, body: {} }, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('handles server errors', async () => {
            db.query.mockRejectedValueOnce(new Error('DB Error'));
            const res = mockRes();
            await controller.updateProfile({ user: { id: 1 }, body: {} }, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('updateUser', () => {
        it('updates user successfully', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ id: 3, email: 'bob@example.com' }] });
            const res = mockRes();
            await controller.updateUser({
                params: { id: '3' }, user: { id: 1 }, body: { email: 'BOB@EXAMPLE.COM' }
            }, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ email: 'bob@example.com' }));
        });

        it('blocks self-deactivation', async () => {
            const blockedRes = mockRes();
            await controller.updateUser({
                params: { id: '2' }, user: { id: 2 }, body: { status: 'inactive' }
            }, blockedRes);
            expect(blockedRes.status).toHaveBeenCalledWith(400);
        });

        it('returns 404 if user not found', async () => {
            db.query.mockResolvedValueOnce({ rows: [] });
            const res = mockRes();
            await controller.updateUser({ params: { id: '99' }, user: { id: 1 }, body: {} }, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('handles server errors', async () => {
            db.query.mockRejectedValueOnce(new Error('DB Error'));
            const res = mockRes();
            await controller.updateUser({ params: { id: '3' }, user: { id: 1 }, body: {} }, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('deleteUser', () => {
        it('deletes user successfully', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ id: 6 }] });
            const res = mockRes();
            await controller.deleteUser({ params: { id: '6' }, user: { id: 1 } }, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
        });

        it('blocks self-deletion', async () => {
            const blockedRes = mockRes();
            await controller.deleteUser({ params: { id: '5' }, user: { id: 5 } }, blockedRes);
            expect(blockedRes.status).toHaveBeenCalledWith(400);
        });

        it('returns 404 if user not found', async () => {
            db.query.mockResolvedValueOnce({ rows: [] });
            const res = mockRes();
            await controller.deleteUser({ params: { id: '99' }, user: { id: 1 } }, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('handles server errors', async () => {
            db.query.mockRejectedValueOnce(new Error('DB Error'));
            const res = mockRes();
            await controller.deleteUser({ params: { id: '6' }, user: { id: 1 } }, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
