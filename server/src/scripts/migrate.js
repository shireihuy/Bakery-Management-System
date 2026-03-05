const { query, pool } = require('../config/db');

async function migrate() {
    console.log('--- Database Migration Started ---');
    console.log(`Targeting Database: ${process.env.DB_NAME} at ${process.env.DB_HOST}:${process.env.DB_PORT}`);

    try {
        // Add payment-related columns to orders if they don't exist
        await query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending',
            ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255)
        `);
        console.log('✅ Updated orders table with payment columns');

        // Create notifications table
        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created notifications table');

        // Add inventory-related columns to products
        await query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS stock_quantity DECIMAL(10, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS min_stock_level DECIMAL(10, 2) DEFAULT 5,
            ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'pcs',
            ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        `);
        console.log('✅ Updated products table with inventory columns');

        console.log('--- Migration Completed Successfully ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        if (err.code === 'ENOTFOUND' && process.env.DB_HOST === 'db') {
            console.log('\nTIP: It looks like you are running this script locally but your DB_HOST is set to "db" (for Docker).');
            console.log('Try changing DB_HOST to "localhost" in your .env file temporarily or run this inside the container.');
        }
        process.exit(1);
    }
}

migrate();
