import { describe, expect, it, vi, beforeEach } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
});

describe('useUsers', () => {
    it('fetches users successfully', async () => {
        const { useUsers } = await import('./useUsers');
        const { fetchUsers, users } = useUsers();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 'u1', name: 'Admin User', role: 'Admin', status: 'active' }]
        });

        localStorage.setItem('token', 'test-token');

        await fetchUsers();

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/users'),
            expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
        );
        expect(users.value).toHaveLength(1);
        expect(users.value[0]?.name).toBe('Admin User');
    });

    it('adds a user successfully', async () => {
        const { useUsers } = await import('./useUsers');
        const { addUser } = useUsers();

        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'u2', name: 'New Cashier' }) })
            .mockResolvedValueOnce({ ok: true, json: async () => [] }); // for fetchUsers

        const result = await addUser({ name: 'New Cashier', email: 'cashier@test.com', role: 'Cashier', status: 'active', phone: '123' });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/auth/register'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('phone_number') // checking if phone mapped
            })
        );
        expect(result.name).toBe('New Cashier');
    });

    it('handles errors when adding a user', async () => {
        const { useUsers } = await import('./useUsers');
        const { addUser } = useUsers();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Email already exists' })
        });

        await expect(addUser({ name: 'Dup', email: 'dup@test.com', role: 'Customer', status: 'active' })).rejects.toThrow('Email already exists');
    });

    it('updates a user successfully', async () => {
        const { useUsers } = await import('./useUsers');
        const { updateUser } = useUsers();

        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true, json: async () => [] }); // for fetchUsers

        await updateUser('u1', {
            name: 'Updated Name',
            address: '42 Main',
            province_id: 202,
            district_id: 1442,
            ward_code: '1A'
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/users/u1'),
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({
                    name: 'Updated Name',
                    address: '42 Main',
                    province_id: 202,
                    district_id: 1442,
                    ward_code: '1A'
                })
            })
        );
    });

    it('throws backend errors when updating a user fails', async () => {
        const { useUsers } = await import('./useUsers');
        const { updateUser } = useUsers();

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Server error updating user' })
        });

        await expect(updateUser('u1', { address: '42 Main' })).rejects.toThrow('Server error updating user');
    });

    it('deletes a user successfully', async () => {
        const { useUsers } = await import('./useUsers');
        const { deleteUser } = useUsers();

        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true, json: async () => [] }); // for fetchUsers

        await deleteUser('u1');

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/users/u1'),
            expect.objectContaining({ method: 'DELETE' })
        );
    });
});
