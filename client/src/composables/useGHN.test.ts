import { describe, expect, it, vi, beforeEach } from 'vitest';

beforeEach(() => {
    vi.resetModules();
});

describe('useGHN', () => {
    it('fetches provinces successfully', async () => {
        const { useGHN } = await import('./useGHN');
        const { fetchProvinces, provinces, loading } = useGHN();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ ProvinceID: 201, ProvinceName: 'Ha Noi' }]
        });

        await fetchProvinces();

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/deliveries/provinces'));
        expect(provinces.value[0].ProvinceName).toBe('Ha Noi');
        expect(loading.value).toBe(false);
    });

    it('fetches districts successfully and clears wards', async () => {
        const { useGHN } = await import('./useGHN');
        const { fetchDistricts, districts, wards } = useGHN();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ DistrictID: 1442, DistrictName: 'Hoan Kiem' }]
        });

        await fetchDistricts(201);

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/deliveries/districts/201'));
        expect(districts.value[0].DistrictName).toBe('Hoan Kiem');
        expect(wards.value).toEqual([]);
    });

    it('fetches wards successfully', async () => {
        const { useGHN } = await import('./useGHN');
        const { fetchWards, wards } = useGHN();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ WardCode: '1A', WardName: 'Phuong 1' }]
        });

        await fetchWards(1442);

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/deliveries/wards/1442'));
        expect(wards.value[0].WardName).toBe('Phuong 1');
    });

    it('fetches fee and converts correctly', async () => {
        const { useGHN } = await import('./useGHN');
        const { fetchFee } = useGHN();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ fee: { total: 50000 } })
        });

        const fee = await fetchFee(1442, '1A', 200);

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/deliveries/fee?district_id=1442&ward_code=1A&weight=200'));
        expect(fee).toBe(2); // 50000 / 25000
    });

    it('returns fallback fee on error', async () => {
        const { useGHN } = await import('./useGHN');
        const { fetchFee } = useGHN();

        global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const fee = await fetchFee(1442, '1A', 200);

        expect(fee).toBe(0.6);
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });
});
