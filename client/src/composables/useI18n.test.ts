import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  document.body.className = '';
});

describe('useI18n', () => {
  it('switches locale, updates body class, and returns translated strings', async () => {
    const setCurrency = vi.fn();

    vi.doMock('./useCurrency', () => ({
      useCurrency: () => ({ setCurrency })
    }));

    const { useI18n } = await import('./useI18n');
    const { currentLocale, setLocale, t, updateTranslation, resetTranslations } = useI18n();

    setLocale('vn');
    expect(currentLocale.value).toBe('vn');
    expect(document.body.className).toBe('antialiased lang-vn');
    expect(setCurrency).toHaveBeenCalledWith('VND');
    expect(t('shop.checkout')).toBe('Thanh toán');

    updateTranslation('vn', 'shop.checkout', 'Thanh toán ngay');
    expect(t('shop.checkout')).toBe('Thanh toán ngay');

    resetTranslations();
    expect(localStorage.getItem('bakery-custom-translations')).toBeNull();
  });
});
