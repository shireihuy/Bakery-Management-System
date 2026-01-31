import { ref } from 'vue';
import { translations } from './translations';
import type { Locale } from './translations';

const locale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'en');

export function useI18n() {
    const t = (key: string): string => {
        const keys = key.split('.');
        let current: any = translations[locale.value];

        for (const k of keys) {
            if (current && current[k]) {
                current = current[k];
            } else {
                // Return default english if not found in current locale
                let fallback: any = translations['en'];
                for (const fk of keys) {
                    if (fallback && fallback[fk]) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key string as fallback
                    }
                }
                return fallback;
            }
        }
        return current;
    };

    const setLocale = (newLocale: Locale) => {
        locale.value = newLocale;
        localStorage.setItem('locale', newLocale);
    };

    return {
        t,
        locale,
        setLocale
    };
}
