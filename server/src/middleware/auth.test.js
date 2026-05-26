const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRoles } = require('./auth');

describe('auth middleware', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
    });

    it('rejects missing token', () => {
        const res = mockRes();
        authenticateToken({ headers: {} }, res, vi.fn());
        expect(res.statusCode).toBe(401);
    });

    it('accepts valid token and authorizes roles', () => {
        const token = jwt.sign({ id: 'u1', role: 'Admin' }, process.env.JWT_SECRET);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockRes();
        const next = vi.fn();

        authenticateToken(req, res, next);
        expect(req.user.role).toBe('Admin');
        expect(next).toHaveBeenCalled();

        const roleNext = vi.fn();
        authorizeRoles('Admin', 'Manager')(req, res, roleNext);
        expect(roleNext).toHaveBeenCalled();
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
