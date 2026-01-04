import { ref, readonly } from 'vue';

export interface OrderItem {
    readonly id?: number;
    readonly productId?: number;
    readonly productName: string;
    readonly quantity: number;
    readonly price: number;
    readonly subtotal: number;
}

export interface Order {
    readonly id: number;
    readonly customerId: string | null;
    readonly customerName: string;
    readonly customerEmail: string;
    readonly items: readonly OrderItem[];
    readonly total: number;
    status: 'Pending' | 'Baking' | 'Ready' | 'Completed' | 'Cancelled';
    readonly date: string;
    readonly startTime?: string;
    readonly completedTime?: string;
    readonly phone?: string;
    readonly address?: string;
    readonly notes?: string;
}

const orders = ref<Order[]>([]);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useOrders() {
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('Fetch orders error:', errData);
                throw new Error(errData.message || 'Failed to fetch orders');
            }

            const data = await response.json();
            // Map DB fields to frontend interface
            orders.value = data.map((o: any) => ({
                id: o.id,
                customerId: o.customer_id,
                customerName: o.customer_name || 'Guest',
                customerEmail: o.customer_email || 'walkin@example.com',
                total: parseFloat(o.total_price),
                status: o.status,
                date: new Date(o.order_date).toLocaleString(),
                items: o.items.map((i: any) => ({
                    id: i.id,
                    productId: i.product_id,
                    productName: i.product_name,
                    quantity: i.quantity,
                    price: parseFloat(i.subtotal) / i.quantity,
                    subtotal: parseFloat(i.subtotal)
                }))
            }));
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const fetchMyOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch my orders');
            }

            const data = await response.json();
            orders.value = data.map((o: any) => ({
                id: o.id,
                customerId: o.customer_id,
                customerName: 'Me', // We know it's us
                customerEmail: '', // Not needed for history
                total: parseFloat(o.total_price),
                status: o.status,
                date: new Date(o.order_date).toLocaleString(),
                items: o.items.map((i: any) => ({
                    id: i.id,
                    productId: i.product_id,
                    productName: i.product_name,
                    quantity: i.quantity,
                    price: parseFloat(i.subtotal) / i.quantity,
                    subtotal: parseFloat(i.subtotal)
                }))
            }));
        } catch (err) {
            console.error('Error fetching my orders:', err);
        }
    };

    const addOrder = async (orderData: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customer_id: orderData.customerId,
                    customer_name: orderData.customerName,
                    total_price: orderData.total,
                    items: orderData.items.map((item: any) => ({
                        product_id: item.productId,
                        quantity: item.quantity,
                        subtotal: item.price * item.quantity
                    }))
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to place order');
            }

            const result = await response.json();
            return result;
        } catch (err) {
            console.error('Error adding order:', err);
            throw err;
        }
    };

    const updateOrderStatus = async (orderId: number, status: Order['status']) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            // Update local state
            const order = orders.value.find(o => o.id === orderId);
            if (order) {
                order.status = status;
            }
        } catch (err) {
            console.error('Error updating status:', err);
            throw err;
        }
    };

    return {
        orders: readonly(orders),
        fetchOrders,
        fetchMyOrders,
        addOrder,
        updateOrderStatus
    };
}
