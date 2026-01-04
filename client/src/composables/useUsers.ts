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
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useUsers() {
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                users.value = data.map((u: any) => ({
                    ...u,
                    role: u.role as User['role']
                }));
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const addUser = async (userData: Omit<User, 'id' | 'joinDate'>) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...userData,
                    phone_number: userData.phone // Mapping frontend 'phone' to backend 'phone_number'
                })
            });
            if (response.ok) {
                await fetchUsers(); // Refresh list
            }
        } catch (err) {
            console.error('Failed to add user:', err);
        }
    };

    const updateUser = async (id: string, updates: Partial<Omit<User, 'id' | 'joinDate'>>) => {
        // Placeholder for PUT /api/users/:id - backend needs this endpoint first
        console.log('Update user', id, updates);
    };

    const deleteUser = async (id: string) => {
        // Placeholder for DELETE /api/users/:id - backend needs this endpoint first
        console.log('Delete user', id);
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
