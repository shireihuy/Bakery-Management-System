import { ref, computed } from 'vue';
import { socketService } from '../services/socket';

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    minQuantity: number;
    unit: string;
    lastRestocked: string;
    isProduct: boolean; // Flag to differentiate between Baked Goods and Supplies
}

const inventory = ref<InventoryItem[]>([]);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export function useInventory() {
    const fetchInventory = async () => {
        try {
            // 1. Fetch Products (Baked Goods)
            const prodRes = await fetch(`${API_URL}/products`, { headers: getAuthHeader() });
            const products = await prodRes.json();

            // 2. Map Products to InventoryItems
            const productItems: InventoryItem[] = products.map((p: any) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                quantity: p.stock || 0,
                minQuantity: p.min_stock || 5,
                unit: p.unit || 'pcs',
                lastRestocked: p.last_restocked ? new Date(p.last_restocked).toISOString().split('T')[0] : 'Never',
                isProduct: true
            }));

            // TODO: In the future, fetch from /api/inventory for supplies
            // For now, we only show Products as inventory
            inventory.value = productItems;
        } catch (err) {
            console.error('Error fetching inventory:', err);
        }
    };

    const lowStockItems = computed(() =>
        inventory.value.filter(item => item.quantity <= item.minQuantity)
    );

    const addItem = async (_item: Omit<InventoryItem, 'id' | 'lastRestocked' | 'isProduct'>) => {
        // This would traditionally be for Supplies. For Products, use useProducts.addProduct
        console.warn('addItem not fully implemented for supplies yet');
    };

    const updateItem = async (id: string, updates: Partial<Omit<InventoryItem, 'id'>>) => {
        const item = inventory.value.find(i => i.id === id);
        if (!item) return;

        if (item.isProduct && ('quantity' in updates || 'minQuantity' in updates)) {
            try {
                const response = await fetch(`${API_URL}/products/${id}/stock`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                    body: JSON.stringify({ 
                        quantity: updates.quantity ?? item.quantity, 
                        minQuantity: updates.minQuantity ?? item.minQuantity,
                        reset: true 
                    })
                });

                if (!response.ok) throw new Error('Failed to update stock');
                await fetchInventory();
            } catch (err) {
                console.error('Error updating product stock:', err);
            }
        }
    };

    const deleteItem = async (_id: string) => {
        // Not implemented for products via inventory view
    };

    const adjustQuantity = async (id: string, amount: number) => {
        const item = inventory.value.find(i => i.id === id);
        if (!item) return;

        if (item.isProduct) {
            try {
                const response = await fetch(`${API_URL}/products/${id}/stock`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                    body: JSON.stringify({ quantity: amount, reset: false })
                });

                if (!response.ok) throw new Error('Failed to update stock');
                await fetchInventory();
            } catch (err) {
                console.error('Error adjusting product stock:', err);
            }
        }
    };

    return {
        inventory,
        lowStockItems,
        fetchInventory,
        addItem,
        updateItem,
        deleteItem,
        adjustQuantity
    };
}

// Global listener for inventory updates
socketService.on('stock:updated', () => {
    const { fetchInventory } = useInventory();
    fetchInventory();
});
