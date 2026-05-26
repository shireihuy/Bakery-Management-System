describe('GHNClient', () => {
    let ghnClient;
    let fetchMock;

    beforeEach(() => {
        vi.resetModules();
        fetchMock = vi.fn();

        const fetchPath = require.resolve('node-fetch');
        require.cache[fetchPath] = { exports: fetchMock };

        process.env.GHN_TOKEN = 'token';
        process.env.GHN_SHOP_ID = '123';
        process.env.GHN_BASE_URL = 'https://example.com/api/';
        delete require.cache[require.resolve('./ghnClient')];
        ghnClient = require('./ghnClient');
    });

    it('fetches provinces, districts, and wards', async () => {
        fetchMock.mockResolvedValue({
            json: async () => ({ code: 200, data: [{ id: 1 }] })
        });

        await expect(ghnClient.getProvinces()).resolves.toEqual([{ id: 1 }]);
        await expect(ghnClient.getDistricts(10)).resolves.toEqual([{ id: 1 }]);
        await expect(ghnClient.getWards(20)).resolves.toEqual([{ id: 1 }]);
    });

    it('calculates fee using available service and fee endpoints', async () => {
        fetchMock
            .mockResolvedValueOnce({ json: async () => ({ code: 200, data: [{ service_id: 53320 }] }) })
            .mockResolvedValueOnce({ json: async () => ({ code: 200, data: { total: 25000 } }) });

        await expect(ghnClient.calculateFee({
            from_district_id: 1454,
            to_district_id: 2,
            to_ward_code: '001',
            weight: 700
        })).resolves.toEqual({ total: 25000 });
    });

    it('throws when no services are available', async () => {
        fetchMock.mockResolvedValueOnce({
            json: async () => ({ code: 200, data: [] })
        });

        await expect(ghnClient.calculateFee({
            to_district_id: 2,
            to_ward_code: '001'
        })).rejects.toThrow('No shipping services available for this route');
    });

    it('creates shipping orders with mapped items', async () => {
        fetchMock.mockResolvedValueOnce({
            json: async () => ({ code: 200, data: { order_code: 'GHN-1' } })
        });

        await expect(ghnClient.createOrder({
            to_name: 'Alice',
            to_phone: '0900',
            to_address: 'Street',
            to_ward_code: '001',
            to_district_id: 2,
            items: [{ id: 1, name: 'Cake', quantity: 2, price: 10 }]
        })).resolves.toEqual({ order_code: 'GHN-1' });

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('shipping-order/create'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Token: 'token',
                    ShopId: '123'
                })
            })
        );
    });

    it('throws on API error codes', async () => {
        fetchMock.mockResolvedValueOnce({
            json: async () => ({ code: 400, message: 'Bad request' })
        });

        await expect(ghnClient.getProvinces()).rejects.toThrow('Bad request');
    });
});
