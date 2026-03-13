import { ref } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function usePayment() {
    const isProcessing = ref(false);
    const error = ref<string | null>(null);

    const initiatePayment = async (orderId: number, method: 'qr' | 'momo' | 'zalopay' | 'cash') => {
        isProcessing.value = true;
        error.value = null;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/payment/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, method })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to initiate payment');
            }

            return await response.json();
        } catch (err: any) {
            error.value = err.message;
            throw err;
        } finally {
            isProcessing.value = false;
        }
    };

    const verifyPaymentStatus = async (orderId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/payment/verify/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to verify payment');
            }

            return await response.json();
        } catch (err: any) {
            console.error('Verify error:', err);
            throw err;
        }
    };

    const simulateSuccessCallback = async (orderId: number) => {
        isProcessing.value = true;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/payment/simulate-callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, status: 'success' })
            });

            if (!response.ok) {
                throw new Error('Failed to simulate callback');
            }

            return await response.json();
        } catch (err: any) {
            console.error('Callback simulation error:', err);
            throw err;
        } finally {
            isProcessing.value = false;
        }
    };

    return {
        isProcessing,
        error,
        initiatePayment,
        verifyPaymentStatus,
        simulateSuccessCallback
    };
}
