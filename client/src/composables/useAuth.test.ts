import { beforeEach, describe, expect, it, vi } from 'vitest';

const joinUserRoom = vi.fn();

vi.doMock('../services/socket', () => ({
  socketService: {
    joinUserRoom
  }
}));

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  joinUserRoom.mockClear();
});

describe('useAuth', () => {
  it('logs in, persists session, and returns dashboard route for staff roles', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'token-123',
        user: {
          id: 'u1',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'Admin',
          status: 'active'
        }
      })
    } as Response);

    const { useAuth } = await import('./useAuth');
    const { login, user, autoLogin, logout } = useAuth();

    const route = await login('admin@example.com', 'secret');
    expect(route).toBe('/dashboard');
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      body: JSON.stringify({ email: 'admin@example.com', password: 'secret' })
    }));
    expect(user.value?.email).toBe('admin@example.com');
    expect(localStorage.getItem('token')).toBe('token-123');
    expect(joinUserRoom).toHaveBeenCalled();

    logout();
    expect(user.value).toBeNull();

    localStorage.setItem('user', JSON.stringify({ id: 'u2', name: 'Customer' }));
    autoLogin();
    expect(user.value?.id).toBe('u2');
  });

  it('returns customer route for non-staff login and handles login/register/profile failures', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'token-456',
          user: {
            id: 'u3',
            name: 'Customer',
            email: 'customer@example.com',
            role: 'Customer',
            status: 'active'
          }
        })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Registration failed' })
      })
      .mockResolvedValueOnce({
        ok: false
      });

    const { useAuth } = await import('./useAuth');
    const { login, register, updateProfile, user } = useAuth();

    await expect(login('customer@example.com', 'secret')).resolves.toBe('/customer');
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      body: JSON.stringify({ email: 'customer@example.com', password: 'secret' })
    }));
    expect(user.value?.role).toBe('Customer');

    await expect(login('bad@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    await expect(register({ email: 'x@example.com' })).rejects.toThrow('Registration failed');
    await expect(updateProfile({ name: 'New Name' })).rejects.toThrow('Failed to update profile');
  });

  it('syncs session from storage events and supports logout', async () => {
    const { useAuth } = await import('./useAuth');
    const { user, setupSessionSync, logout } = useAuth();

    setupSessionSync();

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user',
      oldValue: null,
      newValue: JSON.stringify({ id: 'u9', name: 'Synced User' })
    }));

    expect(user.value?.id).toBe('u9');

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'token',
      oldValue: 'old',
      newValue: 'new'
    }));

    logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
