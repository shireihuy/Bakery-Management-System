import { ref, readonly, computed, onMounted } from 'vue';

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

const dailyHistory = ref<DailyRevenue[]>([]);
const productPerformance = ref<ProductPerformance[]>([]);
const categoryDistribution = ref<{ name: string; value: number }[]>([]);

export function useReports() {
    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('bakery-token');
            const response = await fetch('http://localhost:3000/api/reports/data', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch report data');
            const data = await response.json();

            dailyHistory.value = data.dailyHistory;
            productPerformance.value = data.productPerformance;
            categoryDistribution.value = data.categoryDistribution;
        } catch (err) {
            console.error('Error fetching reports:', err);
        }
    };

    const totalWeeklyRevenue = computed(() =>
        dailyHistory.value.reduce((sum, day) => sum + Number(day.revenue), 0)
    );

    const totalWeeklyOrders = computed(() =>
        dailyHistory.value.reduce((sum, day) => sum + Number(day.orders), 0)
    );

    const averageOrderValue = computed(() =>
        totalWeeklyOrders.value > 0 ? totalWeeklyRevenue.value / totalWeeklyOrders.value : 0
    );

    const maxDailyRevenue = computed(() =>
        dailyHistory.value.length > 0
            ? Math.max(...dailyHistory.value.map(d => Number(d.revenue)))
            : 0
    );

    onMounted(() => {
        fetchReports();
    });

    return {
        dailyHistory: readonly(dailyHistory),
        productPerformance: readonly(productPerformance),
        categoryDistribution: readonly(categoryDistribution),
        totalWeeklyRevenue,
        totalWeeklyOrders,
        averageOrderValue,
        maxDailyRevenue,
        fetchReports
    };
}
