const pool = require('../config/db');

const getMessageHistory = async (req, res) => {
    let { otherUserId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        let query;
        let params;

        const isStaff = ['Admin', 'Manager', 'Cashier'].includes(userRole);

        if (otherUserId === 'SUPPORT') {
            // Customer fetching their own support history
            query = `
                SELECT * FROM chat_messages 
                WHERE (sender_id = $1 AND receiver_id IS NULL)
                   OR (receiver_id = $1 AND sender_id IN (SELECT id FROM users WHERE role IN ('Admin', 'Manager', 'Cashier')))
                ORDER BY created_at ASC
            `;
            params = [userId];
        } else if (isStaff) {
            // Admin/Manager fetching history for a specific customer
            // Include messages from customer to 'null' (Support) AND messages between this customer and ANY staff
            query = `
                SELECT * FROM chat_messages 
                WHERE (sender_id = $1 AND (receiver_id IS NULL OR receiver_id IN (SELECT id FROM users WHERE role IN ('Admin', 'Manager', 'Cashier'))))
                OR (receiver_id = $1 AND sender_id IN (SELECT id FROM users WHERE role IN ('Admin', 'Manager', 'Cashier')))
                ORDER BY created_at ASC
            `;
            params = [otherUserId];
        } else {
            // Standard direct message between non-staff users (if allowed)
            query = `
                SELECT * FROM chat_messages 
                WHERE (sender_id = $1 AND receiver_id = $2) 
                   OR (sender_id = $2 AND receiver_id = $1)
                ORDER BY created_at ASC
            `;
            params = [userId, otherUserId];
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching message history:', err);
        res.status(500).json({ message: 'Server error fetching chat history' });
    }
};

const getConversations = async (req, res) => {
    // This fetches all unique customers who have exchanged messages
    try {
        const result = await pool.query(
            `WITH last_messages AS (
                SELECT 
                    CASE 
                        WHEN sender_id IN (SELECT id FROM users WHERE role IN ('Admin', 'Manager', 'Cashier')) THEN receiver_id 
                        ELSE sender_id 
                    END as customer_id,
                    message,
                    created_at,
                    ROW_NUMBER() OVER(PARTITION BY 
                        CASE 
                            WHEN sender_id IN (SELECT id FROM users WHERE role IN ('Admin', 'Manager', 'Cashier')) THEN receiver_id 
                            ELSE sender_id 
                        END 
                        ORDER BY created_at DESC) as rn
                FROM chat_messages
                WHERE sender_id IS NOT NULL 
            )
            SELECT u.id, u.name, u.email, u.phone_number as phone, u.address, lm.message as last_message, lm.created_at as last_message_time
            FROM users u
            JOIN last_messages lm ON u.id = lm.customer_id
            WHERE lm.rn = 1 AND u.id IS NOT NULL 
              AND u.role NOT IN ('Admin', 'Manager', 'Cashier') -- Only show customers in the support list
            ORDER BY lm.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ message: 'Server error fetching conversations' });
    }
};

module.exports = { getMessageHistory, getConversations };
