const { query } = require('../config/db');

class NotificationController {
    static async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const result = await query(
                'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
                [userId]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    }

    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await query(
                'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
                [id, userId]
            );
            res.json({ message: 'Notification marked as read' });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ error: 'Failed to update notification' });
        }
    }

    static async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            await query(
                'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
                [userId]
            );
            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({ error: 'Failed to update notifications' });
        }
    }

    static async deleteNotification(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await query(
                'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
                [id, userId]
            );
            res.json({ message: 'Notification deleted' });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({ error: 'Failed to delete notification' });
        }
    }

    static async createNotification(userId, title, message, type = 'info') {
        try {
            const result = await query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
                [userId, title, message, type]
            );

            const notification = result.rows[0];

            // Emit via socket if available
            if (global.io) {
                global.io.to(`user_${userId}`).emit('notification:new', notification);
            }

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    static async notifyAdmins(title, message, type = 'warning') {
        try {
            const admins = await query('SELECT id FROM users WHERE role IN ($1, $2)', ['Admin', 'Manager']);
            for (const admin of admins.rows) {
                await this.createNotification(admin.id, title, message, type);
            }
        } catch (error) {
            console.error('Error notifying admins:', error);
        }
    }
    static async notifySupportStaff(title, message, type = 'info') {
        try {
            const staff = await query('SELECT id FROM users WHERE role IN ($1, $2, $3)', ['Admin', 'Manager', 'Cashier']);
            for (const person of staff.rows) {
                await this.createNotification(person.id, title, message, type);
            }
        } catch (error) {
            console.error('Error notifying support staff:', error);
        }
    }
}

module.exports = NotificationController;
