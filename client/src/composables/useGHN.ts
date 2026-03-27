import { ref, readonly } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useGHN() {
    const provinces = ref<any[]>([]);
    const districts = ref<any[]>([]);
    const wards = ref<any[]>([]);
    const loading = ref(false);

    const fetchProvinces = async () => {
        loading.value = true;
        try {
            const res = await fetch(`${API_URL}/deliveries/provinces`);
            provinces.value = await res.json();
        } catch (err) {
            console.error('GHN Error:', err);
        } finally {
            loading.value = false;
        }
    };

    const fetchDistricts = async (provinceId: number) => {
        districts.value = [];
        wards.value = [];
        loading.value = true;
        try {
            const res = await fetch(`${API_URL}/deliveries/districts/${provinceId}`);
            districts.value = await res.json();
        } catch (err) {
            console.error('GHN Error:', err);
        } finally {
            loading.value = false;
        }
    };

    const fetchWards = async (districtId: number) => {
        wards.value = [];
        loading.value = true;
        try {
            const res = await fetch(`${API_URL}/deliveries/wards/${districtId}`);
            wards.value = await res.json();
        } catch (err) {
            console.error('GHN Error:', err);
        } finally {
            loading.value = false;
        }
    };

    const fetchFee = async (districtId: number, wardCode: string, weight: number) => {
        try {
            const res = await fetch(`${API_URL}/deliveries/fee?district_id=${districtId}&ward_code=${wardCode}&weight=${weight}`);
            const data = await res.json();
            // GHN returns VND in 'total'. Convert to USD (e.g. / 25000) for this app's logic
            const feeVnd = data.fee?.total || data.fee || 12500;
            return Number(feeVnd) / 25000; 
        } catch (err) {
            console.error('GHN Fee Error:', err);
            return 0.6; // distinct fallback to see it change
        }
    };

    return {
        provinces: readonly(provinces),
        districts: readonly(districts),
        wards: readonly(wards),
        loading: readonly(loading),
        fetchProvinces,
        fetchDistricts,
        fetchWards,
        fetchFee
    };
}
