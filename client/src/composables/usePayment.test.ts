import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

describe('usePayment', () => {
  it('initiates payment and tracks processing state', async () => {
    localStorage.setItem('token', 'token-123');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'ok', paymentUrl: 'https://pay' })
    } as Response);

    const { usePayment } = await import('./usePayment');
    const { isProcessing, initiatePayment } = usePayment();

    const result = await initiatePayment(7, 'qr');
    expect(result.paymentUrl).toBe('https://pay');
    expect(isProcessing.value).toBe(false);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/payment/initiate'),
      expect.objectContaining({
        method: 'POST'
      })
    );
  });

  it('surfaces initiate payment errors and verifies payment status', async () => {
    localStorage.setItem('token', 'token-123');
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to initiate payment' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'Ready' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'callback ok' })
      });

    const { usePayment } = await import('./usePayment');
    const { initiatePayment, verifyPaymentStatus, simulateSuccessCallback } = usePayment();

    await expect(initiatePayment(7, 'qr')).rejects.toThrow('Failed to initiate payment');
    await expect(verifyPaymentStatus(7)).resolves.toEqual({ status: 'Ready' });
    await expect(simulateSuccessCallback(7)).resolves.toEqual({ message: 'callback ok' });
  });
});
