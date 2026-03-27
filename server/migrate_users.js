const { query } = require('./src/config/db');
const dotenv = require('dotenv');
dotenv.config();

async function migrate() {
    try {
        console.log('--- Migrating Users Table ---');
        await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS province_id INTEGER, ADD COLUMN IF NOT EXISTS district_id INTEGER, ADD COLUMN IF NOT EXISTS ward_code VARCHAR(20);');
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
