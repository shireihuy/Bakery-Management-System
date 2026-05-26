import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

describe('useCurrency', () => {
  it('formats prices and converts values by selected currency', async () => {
    const { useCurrency } = await import('./useCurrency');
    const { currentCurrency, setCurrency, formatPrice, convertToUSD, convertFromUSD } = useCurrency();

    setCurrency('VND');
    expect(currentCurrency.value).toBe('VND');
    expect(convertFromUSD(2, 'JPY')).toBe(300);
    expect(convertToUSD(300, 'JPY')).toBe(2);
    expect(formatPrice(1)).toContain('25,000');
  });
});
