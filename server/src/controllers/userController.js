const pool = require('../config/db');

const updateProfile = async (req, res) => {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id; // From authenticateToken middleware

    console.log('Update profile attempt for user ID:', userId, { name, email, phone, address });

    try {
        // Handle empty strings as null for optional fields
        const finalPhone = (phone === '' || phone === undefined) ? null : phone;
        const finalAddress = (address === '' || address === undefined) ? null : address;

        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2, phone_number = $3, address = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, role, phone_number as phone, address',
            [name, email, finalPhone, finalAddress, userId]
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

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, phone, address, status } = req.body;

    console.log('Admin update user ID:', id, { name, email, role, status });

    try {
        const finalPhone = (phone === '' || phone === undefined) ? null : phone;
        const finalAddress = (address === '' || address === undefined) ? null : address;

        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2, role = $3, phone_number = $4, address = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, name, email, role, phone_number as phone, address',
            [name, email, role, finalPhone, finalAddress, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating user' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

module.exports = { updateProfile, updateUser, deleteUser };
