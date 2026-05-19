const { query } = require('../config/db');

const getReportData = async (req, res) => {
    try {
        const range = req.query.range || '7days';
        const isAllTime = range === 'all';

        const dateColumn = isAllTime ? "TO_CHAR(order_date, 'MM/YYYY')" : "TO_CHAR(order_date, 'Dy')";
        const dateGroup = isAllTime ? "TO_CHAR(order_date, 'MM/YYYY')" : "TO_CHAR(order_date, 'Dy')";
        const dateTruncUnit = isAllTime ? 'month' : 'day';
        
        const dateFilter = isAllTime ? "" : "AND order_date >= CURRENT_DATE - INTERVAL '6 days'";
        const oDateFilter = isAllTime ? "" : "AND o.order_date >= CURRENT_DATE - INTERVAL '6 days'";

        // 1. Daily Revenue & Orders
        const dailyResult = await query(`
            SELECT 
                ${dateColumn} as date,
                CAST(SUM(total_price) AS FLOAT) as revenue,
                CAST(COUNT(id) AS INTEGER) as orders
            FROM orders
            WHERE status != 'Cancelled'
            ${dateFilter}
            GROUP BY ${dateGroup}, DATE_TRUNC('${dateTruncUnit}', order_date)
            ORDER BY DATE_TRUNC('${dateTruncUnit}', order_date) ASC
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
            WHERE o.status != 'Cancelled'
            ${oDateFilter}
            GROUP BY p.name
            ORDER BY sales DESC
            LIMIT 5
        `);

        // 3. Category Distribution
        const totalRevResult = await query(`
            SELECT SUM(total_price) as total 
            FROM orders 
            WHERE status != 'Cancelled'
            ${dateFilter}
        `);
        const totalRevenue = parseFloat(totalRevResult.rows[0].total) || 0;

        const categoryResult = await query(`
            SELECT 
                p.category as name,
                SUM(od.subtotal) as revenue
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            JOIN orders o ON od.order_id = o.id
            WHERE o.status != 'Cancelled'
            ${oDateFilter}
            GROUP BY p.category
            ORDER BY revenue DESC
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
