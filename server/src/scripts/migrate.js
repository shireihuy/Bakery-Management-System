const { query } = require('../config/db');

async function migrate() {
    console.log('--- Database Migration Started ---');
    try {
        // Add payment-related columns to orders if they don't exist
        await query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending',
            ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255)
        `);
        console.log('✅ Updated orders table with payment columns');

        // Ensure payments table has transaction_id too
        await query(`
            ALTER TABLE payments
            ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255)
        `);
        console.log('✅ Updated payments table');

        console.log('--- Migration Completed Successfully ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
