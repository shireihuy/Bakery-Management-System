const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);

        if (!user.sessionId) {
            return res.status(403).json({ message: 'Session expired. Please log in again.' });
        }

        const sessionResult = await query(
            'SELECT current_session_id FROM users WHERE id = $1',
            [user.id]
        );

        if (
            sessionResult.rows.length === 0 ||
            sessionResult.rows[0].current_session_id !== user.sessionId
        ) {
            return res.status(403).json({ message: 'Session expired. This account was logged in elsewhere.' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid Token' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access Denied: Role '${req.user.role}' not authorized` });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };
