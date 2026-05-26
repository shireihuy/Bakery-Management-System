import { describe, expect, it, vi, beforeEach } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
});

describe('useReports', () => {
    it('fetches reports and computes statistics correctly', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                dailyHistory: [
                    { date: '2023-01-01', revenue: 100, orders: 10 },
                    { date: '2023-01-02', revenue: 150, orders: 15 }
                ],
                productPerformance: [
                    { name: 'Cake', sales: 5, revenue: 50 }
                ],
                categoryDistribution: [
                    { name: 'Desserts', value: 100 }
                ]
            })
        });

        const { useReports } = await import('./useReports');
        const {
            dailyHistory,
            productPerformance,
            categoryDistribution,
            totalWeeklyRevenue,
            totalWeeklyOrders,
            averageOrderValue,
            maxDailyRevenue,
            fetchReports
        } = useReports();

        await fetchReports('7days');

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/reports/data?range=7days'),
            expect.any(Object)
        );

        expect(dailyHistory.value).toHaveLength(2);
        expect(productPerformance.value).toHaveLength(1);
        expect(categoryDistribution.value).toHaveLength(1);

        expect(totalWeeklyRevenue.value).toBe(250);
        expect(totalWeeklyOrders.value).toBe(25);
        expect(averageOrderValue.value).toBe(10);
        expect(maxDailyRevenue.value).toBe(150);
    });

    it('handles API errors gracefully when fetching reports', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => 'Internal Server Error'
        });

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { useReports } = await import('./useReports');
        const { fetchReports, dailyHistory } = useReports();

        await fetchReports('30days');

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(dailyHistory.value).toEqual([]);

        consoleErrorSpy.mockRestore();
    });
});
