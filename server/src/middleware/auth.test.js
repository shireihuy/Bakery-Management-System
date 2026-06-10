const jwt = require('jsonwebtoken');

describe('auth middleware', () => {
    let authenticateToken;
    let authorizeRoles;
    let dbQuery;

    beforeEach(() => {
        vi.resetModules();
        process.env.JWT_SECRET = 'test-secret';

        dbQuery = vi.fn();
        const dbPath = require.resolve('../config/db');
        require.cache[dbPath] = { exports: { query: dbQuery } };

        delete require.cache[require.resolve('./auth')];
        ({ authenticateToken, authorizeRoles } = require('./auth'));
    });

    it('rejects missing token', async () => {
        const res = mockRes();
        await authenticateToken({ headers: {} }, res, vi.fn());
        expect(res.statusCode).toBe(401);
    });

    it('accepts valid token and authorizes roles', async () => {
        const token = jwt.sign({ id: 'u1', role: 'Admin', sessionId: '00000000-0000-0000-0000-000000000001' }, process.env.JWT_SECRET);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockRes();
        const next = vi.fn();
        dbQuery.mockResolvedValueOnce({ rows: [{ current_session_id: '00000000-0000-0000-0000-000000000001' }] });

        await authenticateToken(req, res, next);
        expect(req.user.role).toBe('Admin');
        expect(next).toHaveBeenCalled();

        const roleNext = vi.fn();
        authorizeRoles('Admin', 'Manager')(req, res, roleNext);
        expect(roleNext).toHaveBeenCalled();
    });

    it('rejects tokens from an older login session', async () => {
        const token = jwt.sign({ id: 'u1', role: 'Admin', sessionId: '00000000-0000-0000-0000-000000000001' }, process.env.JWT_SECRET);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockRes();
        const next = vi.fn();
        dbQuery.mockResolvedValueOnce({ rows: [{ current_session_id: '00000000-0000-0000-0000-000000000002' }] });

        await authenticateToken(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(res.payload).toEqual({ message: 'Session expired. This account was logged in elsewhere.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('blocks unauthorized role', () => {
        const req = { user: { role: 'Customer' } };
        const res = mockRes();
        const next = vi.fn();

        authorizeRoles('Admin')(req, res, next);
        expect(res.statusCode).toBe(403);
        expect(next).not.toHaveBeenCalled();
    });
});

function mockRes() {
    return {
        statusCode: 200,
        payload: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.payload = body;
            return this;
        }
    };
}
