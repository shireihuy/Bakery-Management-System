import { ref, readonly, computed } from 'vue';

export interface DailyRevenue {
    date: string;
    revenue: number;
    orders: number;
}

export interface ProductPerformance {
    name: string;
    sales: number;
    revenue: number;
    trend: 'up' | 'down' | 'stable';
}

const dailyHistory = ref<DailyRevenue[]>([
    { date: 'Mon', revenue: 1250, orders: 45 },
    { date: 'Tue', revenue: 980, orders: 38 },
    { date: 'Wed', revenue: 1560, orders: 52 },
    { date: 'Thu', revenue: 1100, orders: 41 },
    { date: 'Fri', revenue: 2100, orders: 75 },
    { date: 'Sat', revenue: 2850, orders: 98 },
    { date: 'Sun', revenue: 2400, orders: 82 },
]);

const productPerformance = ref<ProductPerformance[]>([
    { name: 'Matcha Mille Crepe', sales: 124, revenue: 1054, trend: 'up' },
    { name: 'Matcha Latte', sales: 245, revenue: 1347.5, trend: 'up' },
    { name: 'Matcha Cheesecake', sales: 86, revenue: 645, trend: 'stable' },
    { name: 'Green Tea Macarons', sales: 195, revenue: 2340, trend: 'up' },
    { name: 'Matcha Mochi Donut', sales: 156, revenue: 546, trend: 'down' },
]);

export function useReports() {
    const totalWeeklyRevenue = computed(() =>
        dailyHistory.value.reduce((sum, day) => sum + day.revenue, 0)
    );

    const totalWeeklyOrders = computed(() =>
        dailyHistory.value.reduce((sum, day) => sum + day.orders, 0)
    );

    const averageOrderValue = computed(() =>
        totalWeeklyRevenue.value / totalWeeklyOrders.value
    );

    const maxDailyRevenue = computed(() =>
        Math.max(...dailyHistory.value.map(d => d.revenue))
    );

    const categoryDistribution = ref([
        { name: 'Cakes', value: 45 },
        { name: 'Beverages', value: 25 },
        { name: 'Pastries', value: 20 },
        { name: 'Donuts', value: 10 },
    ]);

    return {
        dailyHistory: readonly(dailyHistory),
        productPerformance: readonly(productPerformance),
        categoryDistribution: readonly(categoryDistribution),
        totalWeeklyRevenue,
        totalWeeklyOrders,
        averageOrderValue,
        maxDailyRevenue
    };
}
