const { query } = require('./src/config/db');
const dotenv = require('dotenv');
dotenv.config();

async function checkSchema() {
    try {
        console.log('--- Checking Schema ---');
        
        const tables = ['products', 'orders', 'system_settings', 'coupons'];
        for (const table of tables) {
            console.log(`\nTable: ${table}`);
            const result = await query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.table(result.rows);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
