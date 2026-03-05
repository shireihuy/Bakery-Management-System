import { ref, readonly, computed, onMounted } from 'vue';
import { socketService } from '../services/socket';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    created_at: string;
    is_read: boolean;
    user_id: string;
}

const notifications = ref<Notification[]>([]);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
let isSocketInitialized = false;

const handleNewNotification = (notification: Notification) => {
    // Check for duplicate by ID before adding
    const exists = notifications.value.some(n => n.id === notification.id);
    if (!exists) {
        console.log('New notification received via socket:', notification);
        notifications.value.unshift(notification);

        if (Notification.permission === 'granted') {
            new Notification(notification.title, { body: notification.message });
        }
    }
};

export function useNotifications() {
    const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                notifications.value = data;
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const notification = notifications.value.find(n => n.id === id);
                if (notification) {
                    notification.is_read = true;
                }
            }
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                notifications.value.forEach(n => n.is_read = true);
            }
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                notifications.value = notifications.value.filter(n => n.id !== id);
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    // Initialize listeners only once globally
    if (!isSocketInitialized) {
        socketService.on('notification:new', handleNewNotification);
        isSocketInitialized = true;
    }

    // Initialize only if not already initialized
    onMounted(() => {
        if (notifications.value.length === 0) {
            fetchNotifications();
        }
    });

    return {
        notifications: readonly(notifications),
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications
    };
}
