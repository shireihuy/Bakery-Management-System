import { beforeEach, describe, expect, it, vi } from 'vitest';

const emitMock = vi.fn();
const onMock = vi.fn();

vi.mock('../services/socket', () => ({
  socketService: {
    emit: emitMock,
    on: onMock
  }
}));

vi.mock('./useAuth', () => ({
  useAuth: () => ({
    user: { value: { id: 'u1', name: 'Alice' } }
  })
}));

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  emitMock.mockClear();
  onMock.mockClear();
});

describe('useChat', () => {
  it('fetches history and conversations', async () => {
    localStorage.setItem('token', 'token-123');
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id: 'm1', message: 'Hi' }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id: 'c1', name: 'Bob' }]) });

    const { useChat } = await import('./useChat');
    const { messages, conversations, fetchHistory, fetchConversations } = useChat();

    await fetchHistory('u2');
    await fetchConversations();

    expect(messages.value[0].message).toBe('Hi');
    expect(conversations.value[0].name).toBe('Bob');
  });

  it('sends messages and joins admin room', async () => {
    const { useChat } = await import('./useChat');
    const { sendMessage, joinAdminRoom } = useChat();

    sendMessage('u2', 'Hello');
    sendMessage('u2', '   ');
    joinAdminRoom();

    expect(emitMock).toHaveBeenCalledWith('message:send', {
      sender_id: 'u1',
      receiver_id: 'u2',
      message: 'Hello'
    });
    expect(emitMock).toHaveBeenCalledWith('join:admin', {});
  });
});
