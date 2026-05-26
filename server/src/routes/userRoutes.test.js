describe('userRoutes inline controller', () => {
    let app, request, pool;

    beforeEach(async () => {
        vi.resetModules();

        // Mock the auth middleware to pass through and set a fake user
        require.cache[require.resolve('../middleware/auth')] = {
            exports: {
                authenticateToken: (req, res, next) => {
                    req.user = { id: 1, role: 'Admin' };
                    next();
                },
                authorizeRoles: (...roles) => (req, res, next) => next()
            }
        };

        // Mock the DB
        pool = { query: vi.fn() };
        require.cache[require.resolve('../config/db')] = { exports: pool };

        // Mock the userController to avoid errors
        require.cache[require.resolve('../controllers/userController')] = {
            exports: {
                updateProfile: (req, res) => res.json({}),
                updateUser: (req, res) => res.json({}),
                deleteUser: (req, res) => res.json({})
            }
        };

        const express = require('express');
        const supertest = require('supertest');
        app = express();
        app.use(express.json());
        
        // Load router after mocks
        delete require.cache[require.resolve('./userRoutes')];
        const userRoutes = require('./userRoutes');
        app.use('/api/users', userRoutes);

        request = supertest(app);
    });

    it('GET /api/users fetches all users for admins', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [
                { id: 1, name: 'Admin', joinDate: '2026-05-26T12:00:00Z' },
                { id: 2, name: 'NoDateUser', joinDate: null }
            ]
        });

        const res = await request.get('/api/users');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].joinDate).toBe('2026-05-26');
        expect(res.body[1].joinDate).toBe('N/A');
    });

    it('GET /api/users handles DB errors', async () => {
        pool.query.mockRejectedValueOnce(new Error('DB Error'));

        const res = await request.get('/api/users');

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/Server error/);
    });
});
