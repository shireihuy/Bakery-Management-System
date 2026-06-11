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

describe('useInventory', () => {
  it('fetches and maps inventory items', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ([
        {
          id: '1',
          name: 'Bread',
          category: 'Bakery',
          stock: 5,
          activeQuantity: 4,
          totalQuantity: 6,
          min_stock: 2,
          unit: 'pcs',
          last_restocked: '2026-05-26T00:00:00.000Z',
          batches: [],
          nearestExpiry: null,
          hasExpiredBatch: false
        }
      ])
    } as Response);

    const { useInventory } = await import('./useInventory');
    const { inventory, fetchInventory, lowStockItems } = useInventory();

    await fetchInventory();
    expect(inventory.value[0].name).toBe('Bread');
    expect(inventory.value[0].quantity).toBe(4);
    expect(inventory.value[0].activeQuantity).toBe(4);
    expect(inventory.value[0].totalQuantity).toBe(6);
    expect(lowStockItems.value).toHaveLength(0);
    expect(onMock).toHaveBeenCalledWith('stock:updated', expect.any(Function));
  });

    it('updates stock, adjusts quantity, adds and deletes batches', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    const { useInventory } = await import('./useInventory');
    const { inventory, updateItem, adjustQuantity, addBatch, deleteBatch } = useInventory();

    inventory.value.push({
      id: '1',
      name: 'Cake',
      category: 'Bakery',
      quantity: 3,
      minQuantity: 2,
      unit: 'pcs',
      lastRestocked: 'Never',
      isProduct: true
    });

    await updateItem('1', { minQuantity: 4 });
    await adjustQuantity('1', 2);
    await addBatch('1', { quantity: 5, notes: 'fresh' });
    await deleteBatch('1', 9);
    expect(global.fetch).toHaveBeenCalled();
  });
});
