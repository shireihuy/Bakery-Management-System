import { ref, readonly } from 'vue';
import { socketService } from '../services/socket';

export interface OrderItem {
    readonly id?: number;
    readonly productId?: number;
    readonly productName: string;
    readonly productImage?: string;
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
    readonly discountAmount?: number;
    readonly couponId?: number;
    readonly couponCode?: string;
    status: 'Pending' | 'Ready' | 'Completed' | 'Cancelled';
    readonly date: string;
    readonly startTime?: string;
    readonly completedTime?: string;
    readonly phone?: string;
    readonly address?: string;
    readonly notes?: string;
    readonly paymentStatus?: string;
    readonly paymentMethod?: string;
    readonly transactionId?: string;
    readonly paymentUrl?: string;
    readonly qrCode?: string;
    deliveryType?: 'Pick-up' | 'Delivery';
    deliveryFee?: number;
    district_id?: number;
    ward_code?: string;
    cancel_reason?: string;
}

const orders = ref<Order[]>([]);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
let isSocketInitialized = false;

export function useOrders() {
    const syncOrderStatusFromSocket = async (payload: { orderId?: number; status?: Order['status'] }) => {
        if (!payload?.orderId || !payload.status) return;

        const target = orders.value.find(o => o.id === payload.orderId);
        if (target) {
            target.status = payload.status;
            if (payload.status === 'Completed') {
                (target as any).completedTime = new Date().toLocaleString();
            }
            return;
        }

        try {
            await fetchOrders();
        } catch (err) {
            console.error('Failed to sync order status from socket:', err);
        }
    };

    if (!isSocketInitialized) {
        socketService.on('order:status_updated', syncOrderStatusFromSocket);
        isSocketInitialized = true;
    }

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
                phone: o.customer_phone,
                address: o.customer_address,
                total: parseFloat(o.total_price) || 0,
                discountAmount: parseFloat(o.discount_amount) || 0,
                couponId: o.coupon_id,
                couponCode: o.coupon_code || undefined,
                status: o.status,
                date: new Date(o.order_date).toLocaleString(),
                startTime: o.start_time ? new Date(o.start_time).toLocaleString() : undefined,
                completedTime: o.completed_time ? new Date(o.completed_time).toLocaleString() : undefined,
                paymentStatus: o.payment_status,
                paymentMethod: o.payment_method,
                transactionId: o.transaction_id,
                paymentUrl: o.payment_url,
                qrCode: o.qr_code,
                deliveryType: o.delivery_type,
                deliveryFee: parseFloat(o.delivery_fee) || 0,
                cancel_reason: o.cancel_reason,
                items: o.items.map((i: any) => ({
                    id: i.id,
                    productId: i.product_id,
                    productName: i.product_name,
                    productImage: i.image_url?.startsWith('/') ? `${API_URL.replace('/api', '')}${i.image_url}` : i.image_url,
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
                customerName: o.customer_name || 'Me',
                customerEmail: o.customer_email || 'walkin@example.com',
                address: o.customer_address,
                total: parseFloat(o.total_price) || 0,
                discountAmount: parseFloat(o.discount_amount) || 0,
                couponId: o.coupon_id,
                couponCode: o.coupon_code || undefined,
                status: o.status,
                date: new Date(o.order_date).toLocaleString(),
                startTime: o.start_time ? new Date(o.start_time).toLocaleString() : undefined,
                completedTime: o.completed_time ? new Date(o.completed_time).toLocaleString() : undefined,
                paymentStatus: o.payment_status,
                paymentMethod: o.payment_method,
                transactionId: o.transaction_id,
                paymentUrl: o.payment_url,
                qrCode: o.qr_code,
                deliveryType: o.delivery_type,
                deliveryFee: parseFloat(o.delivery_fee) || 0,
                cancel_reason: o.cancel_reason,
                phone: o.customer_phone,
                items: o.items.map((i: any) => ({
                    id: i.id,
                    productId: i.product_id,
                    productName: i.product_name,
                    productImage: i.image_url?.startsWith('/') ? `${API_URL.replace('/api', '')}${i.image_url}` : i.image_url,
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
                    customer_email: orderData.customerEmail,
                    customer_phone: orderData.customerPhone,
                    customer_address: orderData.customerAddress,
                    district_id: orderData.district_id,
                    ward_code: orderData.ward_code,
                    delivery_type: orderData.deliveryType || 'Pick-up',
                    total_price: orderData.total_price || orderData.total,
                    coupon_code: orderData.coupon_code,
                    items: orderData.items.map((item: any) => ({
                        product_id: item.productId,
                        quantity: item.quantity,
                        subtotal: item.subtotal || (item.price * item.quantity)
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

    const updateOrderStatus = async (orderId: number, status?: Order['status'], paymentStatus?: string, cancelReason?: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, payment_status: paymentStatus, cancel_reason: cancelReason })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to update order status');
            }

            // Update local state
            const order = orders.value.find(o => o.id === orderId);
            if (order) {
                if (status) order.status = status;
                if (paymentStatus) (order as any).paymentStatus = paymentStatus;
                if (cancelReason) order.status === 'Cancelled' && (order.cancel_reason = cancelReason);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            throw err;
        }
    };

    const fetchOrderById = async (id: number | string): Promise<Order | null> => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/orders/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error('Failed to fetch order');
            }

            const o = await response.json();
            return {
                id: o.id,
                customerId: o.customer_id,
                customerName: o.customer_name || 'Guest',
                customerEmail: o.customer_email || 'walkin@example.com',
                total: parseFloat(o.total_price) || 0,
                discountAmount: parseFloat(o.discount_amount) || 0,
                couponId: o.coupon_id,
                couponCode: o.coupon_code || undefined,
                status: o.status,
                date: new Date(o.order_date).toLocaleString(),
                startTime: o.start_time ? new Date(o.start_time).toLocaleString() : undefined,
                completedTime: o.completed_time ? new Date(o.completed_time).toLocaleString() : undefined,
                paymentStatus: o.payment_status,
                paymentMethod: o.payment_method,
                transactionId: o.transaction_id,
                paymentUrl: o.payment_url,
                qrCode: o.qr_code,
                phone: o.customer_phone,
                address: o.customer_address,
                deliveryType: o.delivery_type,
                deliveryFee: parseFloat(o.delivery_fee) || 0,
                district_id: o.district_id,
                ward_code: o.ward_code,
                cancel_reason: o.cancel_reason,
                items: o.items.map((i: any) => ({
                    id: i.id,
                    productId: i.product_id,
                    productName: i.product_name,
                    productImage: i.image_url?.startsWith('/') ? `${API_URL.replace('/api', '')}${i.image_url}` : i.image_url,
                    quantity: i.quantity,
                    price: parseFloat(i.subtotal) / i.quantity,
                    subtotal: parseFloat(i.subtotal)
                }))
            };
        } catch (err) {
            console.error('Error fetching order by ID:', err);
            return null;
        }
    };

    return {
        orders: readonly(orders),
        fetchOrders,
        fetchMyOrders,
        fetchOrderById,
        addOrder,
        updateOrderStatus
    };
}
