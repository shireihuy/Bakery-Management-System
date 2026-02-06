const { query } = require('../config/db');

const getReportData = async (req, res) => {
    try {
        // 1. Daily Revenue & Orders (Last 7 Days)
        const dailyResult = await query(`
            SELECT 
                TO_CHAR(order_date, 'Mon') as date,
                SUM(total_price) as revenue,
                COUNT(id) as orders
            FROM orders
            WHERE order_date >= CURRENT_DATE - INTERVAL '6 days'
            AND status != 'Cancelled'
            GROUP BY TO_CHAR(order_date, 'Mon'), DATE_TRUNC('day', order_date)
            ORDER BY DATE_TRUNC('day', order_date) ASC
        `);

        // 2. Product Performance
        const productResult = await query(`
            SELECT 
                p.name,
                SUM(od.quantity) as sales,
                SUM(od.subtotal) as revenue,
                'stable' as trend
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            JOIN orders o ON od.order_id = o.id
            WHERE o.order_date >= CURRENT_DATE - INTERVAL '6 days'
            AND o.status != 'Cancelled'
            GROUP BY p.name
            ORDER BY sales DESC
            LIMIT 5
        `);

        // 3. Category Distribution
        const totalRevResult = await query("SELECT SUM(total_price) as total FROM orders WHERE order_date >= CURRENT_DATE - INTERVAL '6 days' AND status != 'Cancelled'");
        const totalRevenue = parseFloat(totalRevResult.rows[0].total) || 0;

        const categoryResult = await query(`
            SELECT 
                p.category as name,
                SUM(od.subtotal) as revenue
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            JOIN orders o ON od.order_id = o.id
            WHERE o.order_date >= CURRENT_DATE - INTERVAL '6 days'
            AND o.status != 'Cancelled'
            GROUP BY p.category
        `);

        const categories = categoryResult.rows.map(cat => ({
            name: cat.name,
            value: totalRevenue > 0 ? Math.round((parseFloat(cat.revenue) * 100) / totalRevenue) : 0
        }));

        res.json({
            dailyHistory: dailyResult.rows,
            productPerformance: productResult.rows,
            categoryDistribution: categories
        });

    } catch (err) {
        console.error('Error generating report data:', err);
        res.status(500).json({ message: 'Server error generating reports' });
    }
};

module.exports = {
    getReportData
};
