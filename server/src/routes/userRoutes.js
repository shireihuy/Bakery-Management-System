const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all users (Admin and Manager only)
router.get('/', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, phone_number as phone, created_at as "joinDate" FROM users ORDER BY created_at DESC'
        );

        // Transform data to match frontend expectations if needed
        const users = result.rows.map(user => ({
            ...user,
            status: 'active', // For now, default to active as we don't have this in DB yet
            joinDate: user.joinDate ? new Date(user.joinDate).toISOString().split('T')[0] : 'N/A'
        }));

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

module.exports = router;
