import { ref, readonly, computed } from 'vue';

export interface InventoryItem {
    id: string;
    name: string;
    category: 'Ingredients' | 'Supplies' | 'Packaging';
    quantity: number;
    minQuantity: number;
    unit: string;
    lastRestocked: string;
}

const inventory = ref<InventoryItem[]>([
    {
        id: '1',
        name: 'Ceremonial Matcha Powder',
        category: 'Ingredients',
        quantity: 2.5,
        minQuantity: 5,
        unit: 'kg',
        lastRestocked: '2024-05-15'
    },
    {
        id: '2',
        name: 'All-Purpose Flour',
        category: 'Ingredients',
        quantity: 50,
        minQuantity: 20,
        unit: 'kg',
        lastRestocked: '2024-05-18'
    },
    {
        id: '3',
        name: 'Unsalted Butter',
        category: 'Ingredients',
        quantity: 15,
        minQuantity: 10,
        unit: 'kg',
        lastRestocked: '2024-05-20'
    },
    {
        id: '4',
        name: 'Organic Sugar',
        category: 'Ingredients',
        quantity: 30,
        minQuantity: 15,
        unit: 'kg',
        lastRestocked: '2024-05-18'
    },
    {
        id: '5',
        name: 'Cake Boxes (Medium)',
        category: 'Packaging',
        quantity: 120,
        minQuantity: 50,
        unit: 'pcs',
        lastRestocked: '2024-05-10'
    },
    {
        id: '6',
        name: 'Pastry Brushes',
        category: 'Supplies',
        quantity: 8,
        minQuantity: 2,
        unit: 'pcs',
        lastRestocked: '2024-04-01'
    }
]);

export function useInventory() {
    const lowStockItems = computed(() =>
        inventory.value.filter(item => item.quantity <= item.minQuantity)
    );

    const addItem = (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => {
        const newItem: InventoryItem = {
            id: Math.random().toString(36).substring(2, 9),
            lastRestocked: new Date().toISOString().substring(0, 10),
            ...item
        };
        inventory.value.push(newItem);
        return newItem;
    };

    const updateItem = (id: string, updates: Partial<Omit<InventoryItem, 'id'>>) => {
        const item = inventory.value.find(i => i.id === id);
        if (item) {
            Object.assign(item, updates);
            if ('quantity' in updates) {
                item.lastRestocked = new Date().toISOString().substring(0, 10);
            }
        }
    };

    const deleteItem = (id: string) => {
        inventory.value = inventory.value.filter(i => i.id !== id);
    };

    const adjustQuantity = (id: string, amount: number) => {
        const item = inventory.value.find(i => i.id === id);
        if (item) {
            item.quantity = Math.max(0, item.quantity + amount);
            item.lastRestocked = new Date().toISOString().substring(0, 10);
        }
    };

    return {
        inventory: readonly(inventory),
        lowStockItems,
        addItem,
        updateItem,
        deleteItem,
        adjustQuantity
    };
}
