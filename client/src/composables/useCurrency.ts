import { ref, onMounted } from 'vue';

export type Currency = 'USD' | 'VND' | 'JPY';

export interface CurrencyConfig {
    code: Currency;
    symbol: string;
    rate: number; // Rate relative to USD
    decimalPlaces: number;
}

const currencies = ref<Record<Currency, CurrencyConfig>>({
    USD: { code: 'USD', symbol: '$', rate: 1, decimalPlaces: 2 },
    VND: { code: 'VND', symbol: '₫', rate: 25000, decimalPlaces: 0 },
    JPY: { code: 'JPY', symbol: '¥', rate: 150, decimalPlaces: 0 }
});

const currentCurrency = ref<Currency>((localStorage.getItem('bakery-currency') as Currency) || 'USD');
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useCurrency() {
    const fetchRates = async () => {
        try {
            // First try to get current rates from our API
            const response = await fetch(`${API_URL}/payment/settings`);
            if (response.ok) {
                const data = await response.json();
                if (data.vndRate) {
                    currencies.value.VND.rate = data.vndRate;
                }
                if (data.jpyRate) {
                    currencies.value.JPY.rate = data.jpyRate;
                }
            }
        } catch (err) {
            console.error('Error fetching exchange rates:', err);
        }
    };

    const setCurrency = (code: Currency) => {
        currentCurrency.value = code;
        localStorage.setItem('bakery-currency', code);
    };

    const formatPrice = (amountInUSD: number) => {
        const config = currencies.value[currentCurrency.value];
        const converted = amountInUSD * config.rate;
        
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: config.code,
            minimumFractionDigits: config.decimalPlaces,
            maximumFractionDigits: config.decimalPlaces
        }).format(converted);
    };

    const convertToUSD = (amount: number, fromCurrency: Currency) => {
        const config = currencies.value[fromCurrency];
        return amount / config.rate;
    };

    const convertFromUSD = (amountInUSD: number, toCurrency: Currency) => {
        const config = currencies.value[toCurrency];
        return amountInUSD * config.rate;
    };

    onMounted(() => {
        fetchRates();
    });

    return {
        currencies,
        currentCurrency,
        setCurrency,
        formatPrice,
        convertToUSD,
        convertFromUSD,
        fetchRates
    };
}
