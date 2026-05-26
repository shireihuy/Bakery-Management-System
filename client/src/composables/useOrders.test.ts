import { beforeEach, describe, expect, it, vi } from 'vitest';

const onMock = vi.fn();

vi.mock('../services/socket', () => ({
  socketService: {
    on: onMock
  }
}));

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  onMock.mockClear();
});

describe('useOrders', () => {
  it('fetches orders and maps nested items', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: 1,
          customer_id: 'u1',
          customer_name: 'Alice',
          customer_email: 'alice@example.com',
          total_price: '100',
          discount_amount: '10',
          status: 'Pending',
          order_date: '2026-05-26T00:00:00.000Z',
          items: [{
            id: 11,
            product_id: 2,
            product_name: 'Cake',
            image_url: '/img.png',
            quantity: 2,
            subtotal: '100'
          }]
        }
      ])
    } as Response);

    const { useOrders } = await import('./useOrders');
    const { orders, fetchOrders } = useOrders();
    await fetchOrders();

    expect(orders.value[0].customerName).toBe('Alice');
    expect(orders.value[0].items[0].productImage).toContain('http://localhost:3000/img.png');
    expect(onMock).toHaveBeenCalledWith('order:status_updated', expect.any(Function));
  });

  it('updates order status and syncs from socket payload', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        id: 1,
        customer_id: 'u1',
        customer_name: 'Alice',
        customer_email: 'alice@example.com',
        total_price: '100',
        discount_amount: '0',
        status: 'Pending',
        order_date: '2026-05-26T00:00:00.000Z',
        items: []
      }) });

    const { useOrders } = await import('./useOrders');
    const { orders, updateOrderStatus, fetchOrderById } = useOrders();

    await updateOrderStatus(1, 'Cancelled', 'Paid', 'Out of stock');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/orders/1/status'),
      expect.objectContaining({
        method: 'PUT'
      })
    );

    const result = await fetchOrderById(1);
    expect(result).not.toBeNull();
  });
});
