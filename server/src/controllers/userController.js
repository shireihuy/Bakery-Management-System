const pool = require('../config/db');

const updateProfile = async (req, res) => {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id; // From authenticateToken middleware

    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2, phone_number = $3, address = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, role, phone_number as phone, address',
            [name, email, phone, address, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

module.exports = { updateProfile };
