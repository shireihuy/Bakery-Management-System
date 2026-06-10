const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // In production (Vercel), if we're on HTTPS, ensure the API URL is also HTTPS
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
        // Only upgrade if it's not localhost
        if (!envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
            return envUrl.replace('http://', 'https://');
        }
    }

    return envUrl;
};

export const API_URL = getApiUrl();
export const BASE_URL = API_URL.endsWith('/api') ? API_URL.replace('/api', '') : API_URL;
