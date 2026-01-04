const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password, phone_number, address, role } = req.body;

    console.log('Registration attempt:', { name, email, role, phone_number, address });

    try {
        // Handle empty strings as null for optional fields
        const finalPhone = (phone_number === '' || phone_number === undefined) ? null : phone_number;
        const finalAddress = (address === '' || address === undefined) ? null : address;

        // For development, we allow setting roles. In production, this should be guarded.
        const userRole = (role && ['Admin', 'Manager', 'Baker', 'Cashier', 'Customer'].includes(role)) ? role : 'Customer';

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, phone_number, address, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role, status, phone_number as phone, address',
            [name, email, hashedPassword, finalPhone, finalAddress, userRole, 'active']
        );

        console.log('User registered successfully:', newUser.rows[0].email);
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
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

        const token = jwt.sign(
            { id: user.id, role: user.role },
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
                address: user.address
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { register, login };
