import { ref, onMounted } from 'vue';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Baker' | 'Cashier' | 'Customer';
    status: 'active' | 'inactive';
    phone?: string;
    address?: string;
    joinDate: string;
}

const users = ref<User[]>([]);
const API_URL = 'http://localhost:3000/api';

export function useUsers() {
    const fetchUsers = async () => {
        try {
            // In a real app, you would get this token from localStorage/AuthStore
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                users.value = await response.json();
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const addUser = (userData: Omit<User, 'id' | 'joinDate'>) => {
        // Logic to call POST /api/auth/register or similar
    };

    const updateUser = (id: string, updates: Partial<Omit<User, 'id' | 'joinDate'>>) => {
        // Logic to call PUT /api/users/:id
    };

    const deleteUser = (id: string) => {
        // Logic to call DELETE /api/users/:id
    };

    onMounted(() => {
        if (users.value.length === 0) {
            fetchUsers();
        }
    });

    return {
        users,
        addUser,
        updateUser,
        deleteUser,
        fetchUsers
    };
}
