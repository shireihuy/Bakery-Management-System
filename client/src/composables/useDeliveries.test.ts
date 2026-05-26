import { describe, expect, it, vi, beforeEach } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
});

describe('useDeliveries', () => {
    it('fetches delivery details by order ID successfully', async () => {
        const { useDeliveries } = await import('./useDeliveries');
        const { fetchDeliveryByOrderId, delivery, loading, error } = useDeliveries();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'del1', order_id: 101, status: 'Pending', delivery_fee: 2.5 })
        });

        localStorage.setItem('token', 'test-token');

        const result = await fetchDeliveryByOrderId(101);
        
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/deliveries/orders/101'),
            expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
        );
        expect(delivery.value?.id).toBe('del1');
        expect(result?.status).toBe('Pending');
        expect(loading.value).toBe(false);
        expect(error.value).toBeNull();
    });

    it('handles 404 gracefully when fetching delivery', async () => {
        const { useDeliveries } = await import('./useDeliveries');
        const { fetchDeliveryByOrderId, delivery, error } = useDeliveries();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            status: 404
        });

        const result = await fetchDeliveryByOrderId(102);

        expect(result).toBeNull();
        expect(delivery.value).toBeNull();
        expect(error.value).toBeNull();
    });

    it('requests a new delivery successfully', async () => {
        const { useDeliveries } = await import('./useDeliveries');
        const { requestDelivery, delivery } = useDeliveries();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ delivery: { id: 'del2', status: 'Searching', delivery_fee: 5.0 } })
        });

        const details = { to_name: 'John Doe', to_phone: '123456789' };
        const result = await requestDelivery(103, details);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/deliveries/orders/103/request'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(details)
            })
        );
        expect(delivery.value?.id).toBe('del2');
        expect(result?.status).toBe('Searching');
    });

    it('handles errors when requesting delivery', async () => {
        const { useDeliveries } = await import('./useDeliveries');
        const { requestDelivery, error } = useDeliveries();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Cannot find address' })
        });

        await expect(requestDelivery(104)).rejects.toThrow('Cannot find address');
        expect(error.value).toBe('Cannot find address');
    });
});
