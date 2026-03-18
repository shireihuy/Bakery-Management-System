import { ref } from 'vue';

export interface Delivery {
    id: string;
    order_id: number;
    status: 'Pending' | 'Assigned' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Failed';
    tracking_number: string;
    driver_name?: string;
    driver_phone?: string;
    delivery_fee: number;
    estimated_time?: string;
    actual_time?: string;
    notes?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useDeliveries() {
    const delivery = ref<Delivery | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchDeliveryByOrderId = async (orderId: number) => {
        loading.value = true;
        error.value = null;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/deliveries/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    delivery.value = null;
                    return null;
                }
                throw new Error('Failed to fetch delivery details');
            }

            const data = await response.json();
            delivery.value = data;
            return data;
        } catch (err: any) {
            error.value = err.message;
            console.error('Error fetching delivery:', err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const requestDelivery = async (orderId: number, details: any = {}) => {
        loading.value = true;
        error.value = null;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/deliveries/orders/${orderId}/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(details)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to request delivery');
            }

            const result = await response.json();
            delivery.value = result.delivery;
            return result.delivery;
        } catch (err: any) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        delivery,
        loading,
        error,
        fetchDeliveryByOrderId,
        requestDelivery
    };
}
