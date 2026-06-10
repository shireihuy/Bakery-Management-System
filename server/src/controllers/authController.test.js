describe('authController', () => {
    let authController;
    let dbQuery;
    let bcryptHash, bcryptCompare, jwtSign;

    beforeEach(() => {
        vi.resetModules();
        dbQuery = vi.fn();
        bcryptHash = vi.fn();
        bcryptCompare = vi.fn();
        jwtSign = vi.fn();

        const dbPath = require.resolve('../config/db');
        require.cache[dbPath] = { exports: { query: dbQuery } };

        const bcryptPath = require.resolve('bcryptjs');
        require.cache[bcryptPath] = { exports: { hash: bcryptHash, compare: bcryptCompare } };

        const jwtPath = require.resolve('jsonwebtoken');
        require.cache[jwtPath] = { exports: { sign: jwtSign } };

        delete require.cache[require.resolve('./authController')];
        authController = require('./authController');

        process.env.JWT_SECRET = 'test_secret';
        delete process.env.TURNSTILE_SECRET_KEY;
    });

    const mockRes = () => {
        const res = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };

    describe('register', () => {
        it('registers a new user successfully', async () => {
            const req = {
                body: { name: 'Test', email: 'Test@test.com', password: 'password', role: 'Cashier', status: 'active' }
            };
            const res = mockRes();

            dbQuery.mockResolvedValueOnce({ rows: [] }); // User exists check
            bcryptHash.mockResolvedValueOnce('hashedPassword');
            dbQuery.mockResolvedValueOnce({ rows: [{ id: '1', name: 'Test', email: 'test@test.com', role: 'Cashier' }] }); // Insert user
            jwtSign.mockReturnValueOnce('fake-token');

            await authController.register(req, res);

            expect(dbQuery).toHaveBeenCalledTimes(2);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'fake-token' }));
        });

        it('returns 400 if user already exists', async () => {
            const req = { body: { email: 'test@test.com' } };
            const res = mockRes();
            dbQuery.mockResolvedValueOnce({ rows: [{ id: '1' }] });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User with email test@test.com already exists' });
        });

        it('handles server error during registration', async () => {
            const req = { body: { email: 'test@test.com' } };
            const res = mockRes();
            dbQuery.mockRejectedValueOnce(new Error('DB error'));

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('login', () => {
        it('logs in an active user successfully', async () => {
            const req = { body: { email: 'test@test.com', password: 'password' } };
            const res = mockRes();
            dbQuery.mockResolvedValueOnce({ rows: [{ id: '1', password: 'hashedPassword', status: 'active', role: 'Admin' }] });
            bcryptCompare.mockResolvedValueOnce(true);
            jwtSign.mockReturnValueOnce('fake-token');

            await authController.login(req, res);

            expect(dbQuery).toHaveBeenCalledWith('UPDATE users SET current_session_id = $1 WHERE id = $2', [expect.any(String), '1']);
            expect(jwtSign).toHaveBeenCalledWith(
                expect.objectContaining({ id: '1', role: 'Admin', sessionId: expect.any(String) }),
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'fake-token' }));
        });

        it('returns 400 if Turnstile verification fails', async () => {
            const req = { body: { email: 'test@test.com', password: 'password', turnstileToken: 'bad-token' }, ip: '127.0.0.1' };
            const res = mockRes();
            process.env.TURNSTILE_SECRET_KEY = 'secret-key';
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: false })
            });

            await authController.login(req, res);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        secret: 'secret-key',
                        response: 'bad-token',
                        remoteip: '127.0.0.1'
                    })
                })
            );
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Robot verification failed. Please try again.' });
            expect(dbQuery).not.toHaveBeenCalled();
        });

        it('returns 400 for invalid email', async () => {
            const req = { body: { email: 'notfound@test.com' } };
            const res = mockRes();
            dbQuery.mockResolvedValueOnce({ rows: [] });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });

        it('returns 400 for invalid password', async () => {
            const req = { body: { email: 'test@test.com', password: 'wrong' } };
            const res = mockRes();
            dbQuery.mockResolvedValueOnce({ rows: [{ id: '1', password: 'hashedPassword', status: 'active' }] });
            bcryptCompare.mockResolvedValueOnce(false);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('returns 403 if account is inactive', async () => {
            const req = { body: { email: 'test@test.com', password: 'password' } };
            const res = mockRes();
            dbQuery.mockResolvedValueOnce({ rows: [{ id: '1', password: 'hashedPassword', status: 'inactive' }] });
            bcryptCompare.mockResolvedValueOnce(true);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('handles server error during login', async () => {
            const req = { body: { email: 'test@test.com' } };
            const res = mockRes();
            dbQuery.mockRejectedValueOnce(new Error('DB error'));

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
