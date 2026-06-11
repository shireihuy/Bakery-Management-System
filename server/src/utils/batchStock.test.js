describe('batchStock', () => {
    let batchStock;
    let clientMock;

    beforeEach(() => {
        vi.resetModules();
        clientMock = { query: vi.fn() };
        delete require.cache[require.resolve('./batchStock')];
        batchStock = require('./batchStock');
    });

    it('returns active stock total', async () => {
        clientMock.query.mockResolvedValueOnce({ rows: [{ active_stock: '7' }] });

        const stock = await batchStock.getActiveStock(clientMock, 1);

        expect(stock).toBe(7);
    });

    it('deducts active stock using FEFO and returns allocations', async () => {
        clientMock.query
            .mockResolvedValueOnce({
                rows: [
                    { id: 10, quantity: '3' },
                    { id: 11, quantity: '5' }
                ]
            })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const allocations = await batchStock.deductActiveStockFEFO(clientMock, 1, 4);

        expect(allocations).toEqual([
            { batchId: 10, quantity: 3 },
            { batchId: 11, quantity: 1 }
        ]);
        expect(clientMock.query).toHaveBeenCalledWith(
            'UPDATE product_batches SET quantity = $1 WHERE id = $2',
            [0, 10]
        );
        expect(clientMock.query).toHaveBeenCalledWith(
            'UPDATE product_batches SET quantity = $1 WHERE id = $2',
            [4, 11]
        );
    });

    it('throws when active stock is insufficient', async () => {
        clientMock.query.mockResolvedValueOnce({
            rows: [{ id: 10, quantity: '2' }]
        });

        await expect(batchStock.deductActiveStockFEFO(clientMock, 1, 5))
            .rejects
            .toThrow(/Insufficient active stock/i);
    });

    it('restores saved allocations and syncs product stock', async () => {
        clientMock.query
            .mockResolvedValueOnce({
                rows: [{ id: 99, product_id: 1, quantity: 2 }]
            })
            .mockResolvedValueOnce({
                rows: [{ batch_id: 10, quantity: '2' }]
            })
            .mockResolvedValueOnce({ rows: [{ id: 10 }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        await batchStock.restoreOrderStock(clientMock, 99);

        expect(clientMock.query).toHaveBeenCalledWith(
            'UPDATE product_batches SET quantity = quantity + $1 WHERE id = $2',
            ['2', 10]
        );
    });
});
