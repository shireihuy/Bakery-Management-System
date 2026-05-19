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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useReports() {
    const fetchReports = async (range: string = '7days') => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/reports/data?range=${range}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch report data: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            dailyHistory.value = (data.dailyHistory || []).map((d: any) => ({
                ...d,
                revenue: Number(d.revenue) || 0,
                orders: Number(d.orders) || 0
            }));

            productPerformance.value = (data.productPerformance || []).map((p: any) => ({
                ...p,
                revenue: Number(p.revenue) || 0,
                sales: Number(p.sales) || 0
            }));

            categoryDistribution.value = data.categoryDistribution || [];
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
