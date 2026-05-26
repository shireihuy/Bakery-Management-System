import { describe, expect, it, vi, beforeEach } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
});

describe('useProducts', () => {
    it('fetches products successfully', async () => {
        const { useProducts } = await import('./useProducts');
        const { fetchProducts, products } = useProducts();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { id: '1', name: 'Bread', image: '/images/bread.png' },
                { id: '2', name: 'Cake', image: 'http://external.com/cake.png' }
            ]
        });

        await fetchProducts();

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/products'));
        expect(products.value).toHaveLength(2);
        expect(products.value[0]?.image).toContain('http');
        expect(products.value[1]?.image).toBe('http://external.com/cake.png');
    });

    it('adds a product successfully', async () => {
        const { useProducts } = await import('./useProducts');
        const { addProduct } = useProducts();

        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '3', name: 'New Cake' }) })
            .mockResolvedValueOnce({ ok: true, json: async () => [] }); // for fetchProducts

        localStorage.setItem('token', 'fake-token');

        const newProduct = await addProduct({ name: 'New Cake', price: 10, category: 'Dessert' });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/products'),
            expect.objectContaining({ method: 'POST', headers: { Authorization: 'Bearer fake-token' } })
        );
        expect(newProduct.name).toBe('New Cake');
    });

    it('updates a product successfully', async () => {
        const { useProducts } = await import('./useProducts');
        const { updateProduct } = useProducts();

        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '1', name: 'Updated Bread' }) })
            .mockResolvedValueOnce({ ok: true, json: async () => [] }); // for fetchProducts

        const updated = await updateProduct('1', { name: 'Updated Bread' });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/products/1'),
            expect.objectContaining({ method: 'PUT' })
        );
        expect(updated.name).toBe('Updated Bread');
    });

    it('deletes a product successfully', async () => {
        const { useProducts } = await import('./useProducts');
        const { deleteProduct } = useProducts();

        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true, json: async () => [] }); // for fetchProducts

        await deleteProduct('2');

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/products/2'),
            expect.objectContaining({ method: 'DELETE' })
        );
    });

    it('submits a rating successfully', async () => {
        const { useProducts } = await import('./useProducts');
        const { submitRating } = useProducts();

        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true, json: async () => [] });

        await submitRating('1', 5);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/products/1/rate'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ rating: 5 })
            })
        );
    });

    it('resets ratings successfully', async () => {
        const { useProducts } = await import('./useProducts');
        const { resetRatings } = useProducts();

        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true, json: async () => [] });

        await resetRatings('1');

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/products/1/ratings'),
            expect.objectContaining({ method: 'DELETE' })
        );
    });

    it('fetches tags successfully', async () => {
        const { useProducts } = await import('./useProducts');
        const { fetchTags } = useProducts();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ingredients: ['Flour'], allergens: ['Nuts'] })
        });

        const tags = await fetchTags();

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/products/tags'));
        expect(tags.ingredients).toContain('Flour');
        expect(tags.allergens).toContain('Nuts');
    });

    it('handles errors gracefully in fetchTags', async () => {
        const { useProducts } = await import('./useProducts');
        const { fetchTags } = useProducts();

        global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const tags = await fetchTags();

        expect(tags).toEqual({ ingredients: [], allergens: [] });
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});
