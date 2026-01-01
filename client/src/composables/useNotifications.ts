import { ref, readonly, computed } from 'vue';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    isRead: boolean;
}

const notifications = ref<Notification[]>([
    {
        id: '1',
        title: 'New Order Received',
        message: 'Order #ORD-7742 has been placed by John Doe.',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        isRead: false
    },
    {
        id: '2',
        title: 'Low Stock Alert',
        message: 'Matcha Powder is running low (Current: 2kg).',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        isRead: false
    },
    {
        id: '3',
        title: 'Profile Updated',
        message: 'Your account settings have been successfully updated.',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        isRead: true
    }
]);

export function useNotifications() {
    const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);

    const markAsRead = (id: string) => {
        const notification = notifications.value.find(n => n.id === id);
        if (notification) {
            notification.isRead = true;
        }
    };

    const markAllAsRead = () => {
        notifications.value.forEach(n => n.isRead = true);
    };

    const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotif: Notification = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            isRead: false,
            ...notif
        };
        notifications.value.unshift(newNotif);
        return newNotif;
    };

    const deleteNotification = (id: string) => {
        notifications.value = notifications.value.filter(n => n.id !== id);
    };

    return {
        notifications: readonly(notifications),
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        deleteNotification
    };
}
