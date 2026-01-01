import { ref, readonly } from 'vue';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'baker' | 'cashier' | 'customer';
    status: 'active' | 'inactive';
    phone?: string;
    address?: string;
    joinDate: string;
}

const users = ref<User[]>([
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@bakery.com',
        role: 'admin',
        status: 'active',
        phone: '555-0101',
        address: 'Bakery Headquarters',
        joinDate: '2024-01-15'
    },
    {
        id: '2',
        name: 'Manager User',
        email: 'manager@bakery.com',
        role: 'manager',
        status: 'active',
        joinDate: '2024-02-20'
    },
    {
        id: '3',
        name: 'Baker User',
        email: 'baker@bakery.com',
        role: 'baker',
        status: 'active',
        joinDate: '2024-03-05'
    },
    {
        id: '4',
        name: 'Cashier User',
        email: 'cashier@bakery.com',
        role: 'cashier',
        status: 'active',
        joinDate: '2024-03-10'
    },
    {
        id: '5',
        name: 'John Doe',
        email: 'customer@bakery.com',
        role: 'customer',
        status: 'active',
        phone: '555-0123',
        address: '123 Bakery Lane',
        joinDate: '2024-04-01'
    }
]);

export function useUsers() {
    const addUser = (userData: Omit<User, 'id' | 'joinDate'>) => {
        const newUser: User = {
            id: Math.random().toString(36).substring(2, 9),
            joinDate: new Date().toISOString().substring(0, 10),
            ...userData
        };
        users.value.push(newUser);
        return newUser;
    };

    const updateUser = (id: string, updates: Partial<Omit<User, 'id' | 'joinDate'>>) => {
        const index = users.value.findIndex(u => u.id === id);
        if (index !== -1) {
            const currentUser = users.value[index];
            users.value[index] = { ...currentUser, ...updates } as User;
        }
    };

    const deleteUser = (id: string) => {
        users.value = users.value.filter(u => u.id !== id);
    };

    return {
        users: readonly(users),
        addUser,
        updateUser,
        deleteUser
    };
}
