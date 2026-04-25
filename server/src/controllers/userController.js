const pool = require('../config/db');

const updateProfile = async (req, res) => {
    const { name, email, phone, address, province_id, district_id, ward_code } = req.body;
    const normalizedEmail = email ? email.toLowerCase() : '';
    const userId = req.user.id; // From authenticateToken middleware

    console.log('Update profile attempt for user ID:', userId, { name, email: normalizedEmail, phone, address });

    try {
        // Handle empty strings as null for optional fields
        const finalPhone = (phone === '' || phone === undefined) ? null : phone;
        const finalAddress = (address === '' || address === undefined) ? null : address;

        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2, phone_number = $3, address = $4, province_id = $5, district_id = $6, ward_code = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING id, name, email, role, phone_number as phone, address, province_id, district_id, ward_code',
            [name, normalizedEmail, finalPhone, finalAddress, province_id || null, district_id || null, ward_code || null, userId]
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
    const { name, email, role, phone, address, province_id, district_id, ward_code, status } = req.body;
    const normalizedEmail = email ? email.toLowerCase() : '';

    console.log('Admin update user ID:', id, { name, email: normalizedEmail, role, status });

    try {
        const finalPhone = (phone === '' || phone === undefined) ? null : phone;
        const finalAddress = (address === '' || address === undefined) ? null : address;

        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2, role = $3, phone_number = $4, address = $5, province_id = $6, district_id = $7, ward_code = $8, status = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10 RETURNING id, name, email, role, status, phone_number as phone, address, province_id, district_id, ward_code',
            [name, normalizedEmail, role, finalPhone, finalAddress, province_id || null, district_id || null, ward_code || null, status || 'active', id]
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
    const adminId = req.user.id;

    if (adminId.toString() === id.toString()) {
        return res.status(400).json({ message: 'You cannot delete your own account for safety reasons.' });
    }

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
