import { beforeEach, describe, expect, it, vi } from 'vitest';

const userRef = { value: null as any };

vi.doMock('./useAuth', () => ({
  useAuth: () => ({ user: userRef })
}));

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  userRef.value = null;
});

describe('useCart', () => {
  it('stores guest cart in localStorage and clamps quantity by stock', async () => {
    const { useCart } = await import('./useCart');
    const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();

    await addToCart({ id: 'p1', name: 'Croissant', price: 2, stock: 3 } as any, 2);
    expect(cart.value).toHaveLength(1);
    expect(cart.value[0].quantity).toBe(2);

    await addToCart({ id: 'p1', name: 'Croissant', price: 2, stock: 3 } as any, 5);
    expect(cart.value[0].quantity).toBe(3);

    await updateQuantity('p1', -10);
    expect(cart.value).toHaveLength(0);

    await addToCart({ id: 'p2', name: 'Cake', price: 10, stock: 5 } as any, 1);
    await removeFromCart('p2');
    expect(cart.value).toHaveLength(0);

    await addToCart({ id: 'p3', name: 'Baguette', price: 3, stock: 2 } as any, 1);
    await clearCart();
    expect(cart.value).toEqual([]);
  });

  it('loads guest cart from localStorage and handles authenticated cart operations', async () => {
    localStorage.setItem('bakery_cart', JSON.stringify([{ id: 'g1', name: 'Guest Cake', quantity: 1 }]));

    const { useCart } = await import('./useCart');
    const { cart, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();

    await fetchCart();
    expect(cart.value[0].id).toBe('g1');

    userRef.value = { id: 'u1' };
    localStorage.setItem('token', 'token-123');

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, cart: [{ id: 'p9', name: 'Server Bread', stock: 10, quantity: 2 }] })
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await fetchCart();
    expect(cart.value[0].name).toBe('Server Bread');

    await addToCart({ id: 'p9', name: 'Server Bread', price: 5, stock: 10 } as any, 3);
    await updateQuantity('p9', -1);
    await removeFromCart('p9');
    await clearCart();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cart'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('handles fetchCart and cart mutations gracefully on API errors', async () => {
    userRef.value = { id: 'u2' };
    localStorage.setItem('token', 'token-456');

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ success: false }) })
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    const { useCart } = await import('./useCart');
    const { fetchCart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();

    await fetchCart();
    await expect(addToCart({ id: 'x1', name: 'X', price: 1, stock: 1 } as any)).resolves.toBeUndefined();
    await expect(updateQuantity('x1', 1)).resolves.toBeUndefined();
    await expect(removeFromCart('x1')).resolves.toBeUndefined();
    await expect(clearCart()).resolves.toBeUndefined();
  });
});
