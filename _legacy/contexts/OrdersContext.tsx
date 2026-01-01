import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  phone?: string;
  address?: string;
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getCustomerOrders: (customerId: string) => Order[];
  getAllOrders: () => Order[];
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('bakery_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Initialize with some sample orders
      const sampleOrders: Order[] = [
        {
          id: "ORD-001",
          customerId: "5",
          customerName: "Customer User",
          customerEmail: "customer@bakery.com",
          items: [
            { productName: "Croissant", quantity: 2, price: 5.00 },
            { productName: "Coffee", quantity: 1, price: 3.50 }
          ],
          total: 13.50,
          status: "completed",
          date: "2025-12-28 09:30",
          phone: "(555) 123-4567"
        },
        {
          id: "ORD-002",
          customerId: "5",
          customerName: "Customer User",
          customerEmail: "customer@bakery.com",
          items: [
            { productName: "Sourdough Bread", quantity: 1, price: 6.00 },
            { productName: "Blueberry Muffin", quantity: 4, price: 4.00 }
          ],
          total: 22.00,
          status: "processing",
          date: "2025-12-30 10:15",
          phone: "(555) 123-4567"
        },
      ];
      setOrders(sampleOrders);
      localStorage.setItem('bakery_orders', JSON.stringify(sampleOrders));
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('bakery_orders', JSON.stringify(orders));
    }
  }, [orders]);

  const addOrder = (orderData: Omit<Order, 'id' | 'date'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', ''),
      status: 'pending'
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const getCustomerOrders = (customerId: string): Order[] => {
    return orders.filter(order => order.customerId === customerId);
  };

  const getAllOrders = (): Order[] => {
    return orders;
  };

  return (
    <OrdersContext.Provider value={{ 
      orders, 
      addOrder, 
      updateOrderStatus, 
      getCustomerOrders,
      getAllOrders 
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
