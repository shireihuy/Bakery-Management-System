import { beforeEach, describe, expect, it, vi } from 'vitest';

const onMock = vi.fn();
const joinUserRoom = vi.fn();

vi.mock('../services/socket', () => ({
  socketService: {
    on: onMock,
    joinUserRoom
  }
}));

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  onMock.mockClear();
  joinUserRoom.mockClear();
  vi.useFakeTimers();
  vi.stubGlobal('Audio', class {
    currentTime = 0;
    play = vi.fn().mockResolvedValue(undefined);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useNotifications', () => {
  it('fetches, marks, deletes, and dismisses notifications', async () => {
    localStorage.setItem('token', 'token-123');
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'n1',
            title: 'Hello',
            message: 'World',
            type: 'info',
            created_at: '2026-05-26T00:00:00.000Z',
            is_read: false,
            user_id: 'u1'
          }
        ])
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const { useNotifications } = await import('./useNotifications');
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, dismissToast } = useNotifications();

    await fetchNotifications();
    expect(notifications.value[0].id).toBe('n1');
    expect(unreadCount.value).toBe(1);

    await markAsRead('n1');
    expect(notifications.value[0].is_read).toBe(true);

    await markAllAsRead();
    expect(notifications.value[0].is_read).toBe(true);

    await deleteNotification('n1');
    expect(notifications.value).toHaveLength(0);

    dismissToast('missing');
    expect(onMock).toHaveBeenCalledWith('notification:new', expect.any(Function));
  });

  it('handles incoming socket notifications without duplicates', async () => {
    localStorage.setItem('token', 'token-123');
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });

    const { useNotifications } = await import('./useNotifications');
    const { notifications } = useNotifications();

    const handler = onMock.mock.calls.find(call => call[0] === 'notification:new')?.[1];
    expect(handler).toBeTypeOf('function');

    handler({
      id: 'n2',
      title: 'New',
      message: 'Alert',
      type: 'success',
      created_at: '2026-05-26T00:00:00.000Z',
      is_read: false,
      user_id: 'u1'
    });
    handler({
      id: 'n2',
      title: 'New',
      message: 'Alert',
      type: 'success',
      created_at: '2026-05-26T00:00:00.000Z',
      is_read: false,
      user_id: 'u1'
    });

    expect(notifications.value).toHaveLength(1);
    vi.runOnlyPendingTimers();
  });
});
