const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const register = async (req, res) => {
    const { name, email, password, phone_number, address, province_id, district_id, ward_code, role, status } = req.body;

    

    try {
        // Handle empty strings as null for optional fields
        const finalPhone = (phone_number === '' || phone_number === undefined) ? null : phone_number;
        const finalAddress = (address === '' || address === undefined) ? null : address;

        // For development, we allow setting roles. In production, this should be guarded.
        const userRole = (role && ['Admin', 'Manager', /* 'Baker', */ 'Cashier', 'Customer'].includes(role)) ? role : 'Customer';
        const userStatus = (status && ['active', 'inactive'].includes(status)) ? status : 'active';

        const normalizedEmail = email ? email.toLowerCase() : '';

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (userExists.rows.length > 0) {
            
            return res.status(400).json({ message: `User with email ${normalizedEmail} already exists` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        
        const sessionId = crypto.randomUUID();
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, phone_number, address, province_id, district_id, ward_code, role, status, current_session_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, name, email, role, status, phone_number as phone, address, province_id, district_id, ward_code',
            [name, normalizedEmail, hashedPassword, finalPhone, finalAddress, province_id || null, district_id || null, ward_code || null, userRole, userStatus, sessionId]
        );

        if (newUser.rows.length === 0) {
            throw new Error('Failed to insert user - no rows returned');
        }

        
        
        const user = newUser.rows[0];
        const token = jwt.sign(
            { id: user.id, role: user.role, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user
        });
    } catch (err) {
        console.error('Registration error details:', err);
        res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase() : '';

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({ message: 'Your account is inactive. Please contact the administrator.' });
        }

        const sessionId = crypto.randomUUID();
        await pool.query('UPDATE users SET current_session_id = $1 WHERE id = $2', [sessionId, user.id]);

        const token = jwt.sign(
            { id: user.id, role: user.role, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                phone: user.phone_number,
                address: user.address,
                province_id: user.province_id,
                district_id: user.district_id,
                ward_code: user.ward_code
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { register, login };
