import { ref, readonly } from 'vue';

interface User {
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Baker' | 'Cashier' | 'Customer';
    phone?: string;
    address?: string;
}

const user = ref<User | null>(null);

export function useAuth() {
    const login = (email: string) => {
        // Mock login logic based on email prefix or specific demo emails
        let role: User['role'] = 'Customer';
        let name = 'Customer';
        let redirectPath = '/customer';

        const emailLower = email.toLowerCase();

        if (emailLower.startsWith('admin')) {
            role = 'Admin';
            name = 'Admin User';
            redirectPath = '/dashboard';
        } else if (emailLower.startsWith('manager')) {
            role = 'Manager';
            name = 'Manager User';
            redirectPath = '/dashboard';
        } else if (emailLower.startsWith('baker')) {
            role = 'Baker';
            name = 'Baker User';
            redirectPath = '/dashboard';
        } else if (emailLower.startsWith('cashier')) {
            role = 'Cashier';
            name = 'Cashier User';
            redirectPath = '/dashboard';
        } else if (emailLower.startsWith('customer')) {
            role = 'Customer';
            name = 'John Doe';
            redirectPath = '/customer';
        }

        user.value = {
            name,
            email,
            role,
            phone: '555-0123',
            address: '123 Bakery Lane'
        };

        localStorage.setItem('user', JSON.stringify(user.value));
        return redirectPath;
    };

    const logout = () => {
        user.value = null;
        localStorage.removeItem('user');
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
        logout,
        autoLogin,
        updateProfile
    };
}
