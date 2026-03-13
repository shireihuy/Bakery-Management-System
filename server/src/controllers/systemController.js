const { query } = require('../config/db');

/**
 * Fetch system settings
 * GET /api/system/settings
 */
const getSystemSettings = async (req, res) => {
    try {
        const result = await query('SELECT key, value FROM system_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (err) {
        console.error('Error fetching system settings:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Update system settings
 * POST /api/system/settings
 */
const updateSystemSettings = async (req, res) => {
    const { key, value } = req.body;
    try {
        await query(
            'INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
            [key, JSON.stringify(value)]
        );
        res.json({ message: 'Setting updated successfully' });
    } catch (err) {
        console.error('Error updating system settings:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getSystemSettings,
    updateSystemSettings
};
