const { query } = require('../config/db');

async function migrate() {
    try {
        await query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending',
            ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255)
        `);

        await query(`
            UPDATE orders
            SET status = 'Ready'
            WHERE status = 'Baking'
        `);

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

        await query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS stock_quantity DECIMAL(10, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS min_stock_level DECIMAL(10, 2) DEFAULT 5,
            ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'pcs',
            ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        `);

        await query(`
            ALTER TABLE products DROP COLUMN IF EXISTS expiration_date
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS product_batches (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
                expiration_date TIMESTAMP WITH TIME ZONE,
                received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                notes VARCHAR(255)
            )
        `);

        await query(`
            INSERT INTO product_batches (product_id, quantity, expiration_date, notes)
            SELECT p.id, p.stock_quantity, NULL, 'Initial stock (migrated)'
            FROM products p
            WHERE p.stock_quantity > 0
              AND NOT EXISTS (
                  SELECT 1 FROM product_batches b WHERE b.product_id = p.id
              )
        `);
    } catch (err) {
        console.error('Migration failed:', err.message);
        throw err;
    }
}

if (require.main === module) {
    migrate()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = migrate;
