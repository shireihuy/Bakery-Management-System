<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
    Search, 
    Plus, 
    Warehouse, 
    AlertTriangle, 
    History, 
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Minus,
    ArrowUpRight,
    X,
    ClipboardList
} from 'lucide-vue-next';
import { useInventory, type InventoryItem } from '../composables/useInventory';

const { inventory, lowStockItems, addItem, updateItem, deleteItem, adjustQuantity } = useInventory();

const searchQuery = ref('');
const categoryFilter = ref('all');
const isModalOpen = ref(false);
const editingItem = ref<InventoryItem | null>(null);

const form = ref({
    name: '',
    category: 'Ingredients' as InventoryItem['category'],
    quantity: 0,
    minQuantity: 0,
    unit: ''
});

const filteredInventory = computed(() => {
    return inventory.value.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCategory = categoryFilter.value === 'all' || item.category === categoryFilter.value;
        return matchesSearch && matchesCategory;
    });
});

const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' };
    if (item.quantity <= item.minQuantity) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200' };
};

const openAddModal = () => {
    editingItem.value = null;
    form.value = { name: '', category: 'Ingredients', quantity: 0, minQuantity: 0, unit: '' };
    isModalOpen.value = true;
};

const openEditModal = (item: InventoryItem) => {
    editingItem.value = item;
    form.value = { ...item };
    isModalOpen.value = true;
};

const handleSubmit = () => {
    if (editingItem.value) {
        updateItem(editingItem.value.id, form.value);
    } else {
        addItem(form.value);
    }
    isModalOpen.value = false;
};

const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this item from inventory?')) {
        deleteItem(id);
    }
};
</script>

<template>
    <div class="space-y-6">
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-green-100 text-green-600 rounded-xl">
                        <Warehouse class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-medium">Total Items</p>
                        <p class="text-2xl font-bold text-gray-900">{{ inventory.length }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        <AlertTriangle class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-medium">Low Stock</p>
                        <p class="text-2xl font-bold text-gray-900">{{ lowStockItems.length }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <ClipboardList class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-medium">Categories</p>
                        <p class="text-2xl font-bold text-gray-900">3</p>
                    </div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-purple-100 text-purple-600 rounded-xl">
                        <History class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 font-medium">Restocks Today</p>
                        <p class="text-2xl font-bold text-gray-900">2</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Header Actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-green-900">Inventory Management</h2>
                <p class="text-sm text-green-600">Monitor and manage bakery ingredients and supplies</p>
            </div>
            <button 
                @click="openAddModal"
                class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-md transition-all active:scale-95"
            >
                <Plus class="w-4 h-4" />
                Add New Item
            </button>
        </div>

        <!-- Filters & Search -->
        <div class="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex flex-col md:flex-row gap-4">
            <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Search inventory items..." 
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                >
            </div>
            <div class="flex items-center gap-2">
                <Filter class="w-4 h-4 text-green-600" />
                <select 
                    v-model="categoryFilter"
                    class="border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-[150px]"
                >
                    <option value="all">All Categories</option>
                    <option value="Ingredients">Ingredients</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Packaging">Packaging</option>
                </select>
            </div>
        </div>

        <!-- Inventory List -->
        <div class="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-green-50/50 text-green-900 border-b border-green-100 font-medium font-bold px-6">
                        <tr>
                            <th class="px-6 py-4">Item Details</th>
                            <th class="px-6 py-4">Category</th>
                            <th class="px-6 py-4">Stock Level</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4">Last Restock</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="item in filteredInventory" :key="item.id" class="hover:bg-green-50/30 transition-colors group">
                            <td class="px-6 py-4">
                                <div>
                                    <div class="font-bold text-gray-900">{{ item.name }}</div>
                                    <div class="text-xs text-gray-500">ID: {{ item.id }}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                    {{ item.category }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-32 bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                            class="h-full transition-all duration-500"
                                            :class="item.quantity <= item.minQuantity ? 'bg-orange-500' : 'bg-green-500'"
                                            :style="{ width: `${Math.min(100, (item.quantity / (item.minQuantity * 2)) * 100)}%` }"
                                        ></div>
                                    </div>
                                    <span class="font-bold text-gray-900">{{ item.quantity }} {{ item.unit }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span :class="`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStockStatus(item).color}`">
                                    {{ getStockStatus(item).label }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-gray-500 text-xs">
                                {{ item.lastRestocked }}
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex justify-end items-center gap-2">
                                    <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                        <button @click="adjustQuantity(item.id, -1)" class="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                                            <Minus class="w-3 h-3" />
                                        </button>
                                        <button @click="adjustQuantity(item.id, 1)" class="p-1.5 hover:bg-green-50 text-gray-500 hover:text-green-500 transition-colors border-l border-gray-200">
                                            <Plus class="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div class="relative group/actions">
                                        <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                            <MoreVertical class="w-4 h-4" />
                                        </button>
                                        <div class="absolute right-0 bottom-full mb-2 hidden group-hover/actions:block w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10">
                                            <button @click="openEditModal(item)" class="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-green-50 flex items-center gap-2">
                                                <Edit class="w-3 h-3" /> Edit Item
                                            </button>
                                            <button @click="handleDelete(item.id)" class="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <Trash2 class="w-3 h-3" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-green-100">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50/30">
                    <h2 class="text-xl font-bold text-green-900">
                        {{ editingItem ? 'Edit Inventory Item' : 'New Inventory Item' }}
                    </h2>
                    <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600">
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-gray-700">Item Name</label>
                        <input v-model="form.name" type="text" required class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">Category</label>
                            <select v-model="form.category" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white font-medium">
                                <option value="Ingredients">Ingredients</option>
                                <option value="Supplies">Supplies</option>
                                <option value="Packaging">Packaging</option>
                            </select>
                        </div>
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">Unit (kg, l, pcs...)</label>
                            <input v-model="form.unit" type="text" required placeholder="e.g. kg" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">Current Quantity</label>
                            <div class="relative">
                                <input v-model.number="form.quantity" type="number" step="0.1" required class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                                <ArrowUpRight class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">Min. Stock Alert</label>
                            <div class="relative">
                                <input v-model.number="form.minQuantity" type="number" step="0.1" required class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                                <AlertTriangle class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-6 border-t border-gray-50 mt-6">
                        <button type="button" @click="isModalOpen = false" class="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-8 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md transition-all active:scale-95">
                            {{ editingItem ? 'Save Changes' : 'Add Item' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
