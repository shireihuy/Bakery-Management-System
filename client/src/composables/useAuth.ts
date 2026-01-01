import { ref, readonly } from 'vue';

interface User {
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'baker' | 'cashier' | 'customer';
    phone?: string;
    address?: string;
}

const user = ref<User | null>(null);

export function useAuth() {
    const login = (email: string) => {
        // Mock login logic based on email prefix or specific demo emails
        let role: User['role'] = 'customer';
        let name = 'Customer';
        let redirectPath = '/customer';

        const emailLower = email.toLowerCase();

        if (emailLower.startsWith('admin')) {
            role = 'admin';
            name = 'Admin User';
            redirectPath = '/dashboard';
        } else if (emailLower.startsWith('manager')) {
            role = 'manager';
            name = 'Manager User';
            redirectPath = '/dashboard';
        } else if (emailLower.startsWith('baker')) {
            role = 'baker';
            name = 'Baker User';
            redirectPath = '/dashboard';
        } else if (emailLower.startsWith('cashier')) {
            role = 'cashier';
            name = 'Cashier User';
            redirectPath = '/dashboard';
        } else if (emailLower.startsWith('customer')) {
            role = 'customer';
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
