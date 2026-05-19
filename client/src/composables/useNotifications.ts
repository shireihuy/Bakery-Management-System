import { ref, readonly, computed, onMounted } from 'vue';
import { socketService } from '../services/socket';

import notificationSound from '../assets/notification.mp3';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    created_at: string;
    is_read: boolean;
    user_id: string;
}

export interface ToastNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration: number;
}

const notifications = ref<Notification[]>([]);
const toastQueue = ref<ToastNotification[]>([]);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
let isSocketInitialized = false;

// Initialize audio once to be ready for playback
const audio = new Audio(notificationSound);

const playSound = () => {
    // Reset and play
    audio.currentTime = 0;
    audio.play().catch(error => {
        // Silently fail if autoplay is blocked or other issues
        console.warn('Audio playback failed:', error);
    });
};

const addToast = (notification: Notification, duration = 5000) => {
    const toast: ToastNotification = {
        id: `toast-${notification.id}-${Date.now()}`,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        duration,
    };
    
    // Play sound for the new toast
    playSound();
    
    toastQueue.value.push(toast);
    // Auto-dismiss after duration
    setTimeout(() => {
        toastQueue.value = toastQueue.value.filter(t => t.id !== toast.id);
    }, duration);
};

const handleNewNotification = (notification: Notification) => {
    // Check for duplicate by ID before adding
    const exists = notifications.value.some(n => n.id === notification.id);
    if (!exists) {
        
        notifications.value.unshift(notification);
        // Show in-app toast popup
        addToast(notification);
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
        // Ensure socket joined the user room (handles page refresh + already-connected case)
        socketService.joinUserRoom();
        if (notifications.value.length === 0) {
            fetchNotifications();
        }
    });

    const dismissToast = (id: string) => {
        toastQueue.value = toastQueue.value.filter(t => t.id !== id);
    };

    return {
        notifications: readonly(notifications),
        toastQueue: readonly(toastQueue),
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        dismissToast
    };
}
