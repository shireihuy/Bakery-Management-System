const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Try localhost first if db fails
const tryConnection = async (host) => {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: host,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
    try {
        await pool.query('SELECT 1');
        return pool;
    } catch (e) {
        console.log(`Failed to connect to ${host}:`, e.message);
        return null;
    }
};

const seed = async () => {
    let pool = await tryConnection('localhost');
    if (!pool) pool = await tryConnection('db');

    if (!pool) {
        console.error('Could not connect to database on localhost or db');
        process.exit(1);
    }

    console.log('Connected to database. Generating test data...');

    const products = [
        { id: 1, price: 5.00 },
        { id: 2, price: 6.00 },
        { id: 3, price: 3.00 },
        { id: 4, price: 3.50 },
        { id: 5, price: 12.00 },
        { id: 6, price: 7.50 },
        { id: 7, price: 22.00 },
        { id: 10, price: 5.50 }
    ];

    const today = new Date();

    try {
        await pool.query('BEGIN');

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);

            // Generate 3-8 orders per day
            const orderCount = Math.floor(Math.random() * 6) + 3;

            for (let j = 0; j < orderCount; j++) {
                // Select 1-3 random products
                const itemCount = Math.floor(Math.random() * 3) + 1;
                let totalPrice = 0;
                const items = [];

                for (let k = 0; k < itemCount; k++) {
                    const prod = products[Math.floor(Math.random() * products.length)];
                    const qty = Math.floor(Math.random() * 2) + 1;
                    const subtotal = prod.price * qty;
                    totalPrice += subtotal;
                    items.push({ id: prod.id, qty, subtotal });
                }

                const orderResult = await pool.query(
                    'INSERT INTO orders (customer_id, customer_name, total_price, status, order_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    ['GUEST', `Test Customer ${i}-${j}`, totalPrice, 'Completed', date]
                );

                const orderId = orderResult.rows[0].id;

                for (const item of items) {
                    await pool.query(
                        'INSERT INTO order_details (order_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4)',
                        [orderId, item.id, item.qty, item.subtotal]
                    );
                }
            }
        }

        await pool.query('COMMIT');
        console.log('Test data generated successfully for the last 7 days.');
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Error seeding data:', err);
    } finally {
        await pool.end();
    }
};

seed();
