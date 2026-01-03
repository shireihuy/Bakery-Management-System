import { ref, readonly } from 'vue';

export interface OrderItem {
    productName: string;
    quantity: number;
    price: number;
}

export interface Order {
    readonly id: string;
    readonly customerId: string;
    readonly customerName: string;
    readonly customerEmail: string;
    readonly items: readonly OrderItem[];
    readonly total: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    readonly date: string;
    startTime?: string;
    completedTime?: string;
    readonly phone?: string;
    readonly address?: string;
    readonly notes?: string;
}

const orders = ref<Order[]>([
    {
        id: "ORD-1234",
        customerId: "cust-001",
        customerName: "John Doe",
        customerEmail: "customer@bakery.com",
        items: [
            { productName: "Croissant", quantity: 2, price: 5.00 },
            { productName: "Matcha Latte", quantity: 1, price: 5.50 }
        ],
        total: 15.50,
        status: "completed",
        date: new Date().toLocaleDateString(),
        phone: "555-0123",
        address: "123 Main St"
    }
]);

export function useOrders() {
    const addOrder = (orderData: Omit<Order, 'id' | 'date'>) => {
        const newOrder: Order = {
            id: `ORD-${Math.floor(Math.random() * 10000)}`,
            date: new Date().toLocaleDateString(),
            ...orderData
        };
        orders.value.push(newOrder);
        return newOrder;
    };

    const getCustomerOrders = (email: string) => {
        if (!email) return orders.value;
        return orders.value.filter(o => o.customerEmail === email);
    };

    const updateOrderStatus = (orderId: string, status: Order['status']) => {
        const order = orders.value.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            if (status === 'completed') {
                order.completedTime = new Date().toLocaleTimeString();
            } else if (status === 'processing' && !order.startTime) {
                order.startTime = new Date().toLocaleTimeString();
            }
        }
    };

    return {
        orders: readonly(orders),
        addOrder,
        getCustomerOrders,
        updateOrderStatus
    };
}
