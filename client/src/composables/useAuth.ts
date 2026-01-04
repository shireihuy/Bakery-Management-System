import { ref, readonly } from 'vue';

interface User {
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Baker' | 'Cashier' | 'Customer';
    phone?: string;
    address?: string;
}

const user = ref<User | null>(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useAuth() {
    const login = async (email: string, password?: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            user.value = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            // Return redirect path based on role
            const role = data.user.role.toLowerCase();
            if (['admin', 'manager', 'baker', 'cashier'].includes(role)) {
                return '/dashboard';
            }
            return '/customer';
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    };

    const register = async (userData: any) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Registration failed');
            }

            const data = await response.json();
            // Automatically log in after registration? 
            // For now, let's just return success and let the component handle it.
            return data;
        } catch (err) {
            console.error('Registration error:', err);
            throw err;
        }
    };

    const logout = () => {
        user.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const autoLogin = () => {
        const stored = localStorage.getItem('user');
        if (stored) {
            user.value = JSON.parse(stored);
        }
    };

    const updateProfile = (updates: Partial<User>) => {
        if (user.value) {
            user.value = { ...user.value, ...updates };
            localStorage.setItem('user', JSON.stringify(user.value));
        }
    };

    return {
        user: readonly(user),
        login,
        register,
        logout,
        autoLogin,
        updateProfile
    };
}
