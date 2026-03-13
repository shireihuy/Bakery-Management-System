import { ref } from 'vue';
import { type Language, type TranslationSchema, defaultTranslations } from './translations';
import { useCurrency, type Currency } from './useCurrency';

// Singleton state
const currentLocale = ref<Language>((localStorage.getItem('bakery-locale') as Language) || 'en');
const customTranslations = ref<Record<Language, TranslationSchema>>(
    JSON.parse(localStorage.getItem('bakery-custom-translations') || 'null') || defaultTranslations
);

export function useI18n() {
    const { setCurrency } = useCurrency();

    const localeToCurrency: Record<Language, Currency> = {
        en: 'USD',
        jp: 'JPY',
        vn: 'VND'
    };

    const setLocale = (lang: Language) => {
        currentLocale.value = lang;
        localStorage.setItem('bakery-locale', lang);
        document.body.className = `antialiased lang-${lang}`;
        
        // Auto-update currency to match language
        const targetCurrency = localeToCurrency[lang];
        if (targetCurrency) {
            setCurrency(targetCurrency);
        }
    };

    const t = (path: string): string => {
        const keys = path.split('.');
        let result: any = customTranslations.value[currentLocale.value];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                return path; // Fallback to key name
            }
        }
        return result;
    };

    const updateTranslation = (lang: Language, path: string, value: string) => {
        const keys = path.split('.');
        const newTranslations = JSON.parse(JSON.stringify(customTranslations.value)) as Record<Language, any>;
        let current = newTranslations[lang];

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i] as string;
            if (!current[key]) current[key] = {};
            current = current[key];
        }

        const lastKey = keys[keys.length - 1] as string;
        current[lastKey] = value;
        customTranslations.value = newTranslations as Record<Language, TranslationSchema>;
        localStorage.setItem('bakery-custom-translations', JSON.stringify(newTranslations));
    };

    const resetTranslations = () => {
        customTranslations.value = JSON.parse(JSON.stringify(defaultTranslations));
        localStorage.removeItem('bakery-custom-translations');
    };

    // Initialize body class
    if (typeof document !== 'undefined') {
        document.body.className = `antialiased lang-${currentLocale.value}`;
    }

    return {
        currentLocale,
        setLocale,
        t,
        translations: customTranslations,
        updateTranslation,
        resetTranslations
    };
}
