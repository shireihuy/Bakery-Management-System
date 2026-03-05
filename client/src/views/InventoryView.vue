<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
    Search, 
    Plus, 
    Warehouse, 
    AlertTriangle, 
    History, 
    Filter,
    Edit,
    Trash2,
    X,
    ClipboardList
} from 'lucide-vue-next';
import { useInventory, type InventoryItem } from '../composables/useInventory';
import { useI18n } from '../composables/useI18n';
import { useAuth } from '../composables/useAuth';

const { inventory, lowStockItems, fetchInventory, addItem, updateItem, deleteItem } = useInventory();
const { t } = useI18n();
const { user } = useAuth();

const searchQuery = ref('');
const categoryFilter = ref('all');
const isModalOpen = ref(false);
const editingItem = ref<InventoryItem | null>(null);

// Local state for inline quantity adjustments in the table
const inlineQuantities = ref<Record<string, number>>({});

const isBaker = computed(() => user.value?.role === 'Baker');

const form = ref({
    name: '',
    category: '' as InventoryItem['category'],
    quantity: 0,
    minQuantity: 0,
    unit: ''
});

onMounted(async () => {
    await fetchInventory();
    // Initialize inline quantities
    inventory.value.forEach(item => {
        inlineQuantities.value[item.id] = item.quantity;
    });
});

const filteredInventory = computed(() => {
    return inventory.value.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCategory = categoryFilter.value === 'all' || item.category === categoryFilter.value;
        return matchesSearch && matchesCategory;
    });
});

const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: t('inventory.outOfStock'), color: 'bg-red-100 text-red-700 border-red-200' };
    if (item.quantity <= item.minQuantity) return { label: t('inventory.lowStock'), color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: t('inventory.inStock'), color: 'bg-green-100 text-green-700 border-green-200' };
};

const openAddModal = () => {
    if (isBaker.value) return; 
    editingItem.value = null;
    form.value = { name: '', category: '', quantity: 0, minQuantity: 0, unit: '' };
    isModalOpen.value = true;
};

const openEditModal = (item: InventoryItem) => {
    editingItem.value = item;
    form.value = { 
        name: item.name, 
        category: item.category, 
        quantity: item.quantity, 
        minQuantity: item.minQuantity, 
        unit: item.unit 
    };
    isModalOpen.value = true;
};

const handleInlineSave = async (id: string) => {
    const newQty = inlineQuantities.value[id];
    await updateItem(id, { quantity: newQty });
};

const handleSubmit = async () => {
    if (editingItem.value) {
        await updateItem(editingItem.value.id, form.value);
    } else {
        await addItem(form.value);
    }
    isModalOpen.value = false;
    await fetchInventory();
};

const handleDelete = (id: string) => {
    if (isBaker.value) return;
    if (confirm(t('users.confirmDeletion'))) {
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
                        <p class="text-sm text-gray-500 font-medium">{{ t('inventory.totalItems') }}</p>
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
                        <p class="text-sm text-gray-500 font-medium">{{ t('inventory.lowStock') }}</p>
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
                        <p class="text-sm text-gray-500 font-medium">{{ t('inventory.categories') }}</p>
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
                        <p class="text-sm text-gray-500 font-medium">{{ t('inventory.restocksToday') }}</p>
                        <p class="text-2xl font-bold text-gray-900">2</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Header Actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-green-900">{{ t('inventory.inventoryManagement') }}</h2>
                <p class="text-sm text-green-600">{{ t('inventory.monitorAndManage') }}</p>
            </div>
            <button 
                v-if="!isBaker"
                @click="openAddModal"
                class="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-md transition-all active:scale-95"
            >
                <Plus class="w-4 h-4" />
                {{ t('inventory.addNewItem') }}
            </button>
        </div>

        <!-- Filters & Search -->
        <div class="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex flex-col md:flex-row gap-4">
            <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    v-model="searchQuery"
                    type="text" 
                    :placeholder="t('inventory.searchPlaceholder')" 
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                >
            </div>
            <div class="flex items-center gap-2">
                <Filter class="w-4 h-4 text-green-600" />
                <select 
                    v-model="categoryFilter"
                    class="border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-[150px]"
                >
                    <option value="all">{{ t('inventory.allCategories') }}</option>
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
                    <thead class="bg-green-50/50 text-green-900 border-b border-green-100 font-bold px-6">
                        <tr>
                            <th class="px-6 py-4">{{ t('inventory.itemDetails') }}</th>
                            <th class="px-6 py-4">{{ t('inventory.category') }}</th>
                            <th class="px-6 py-4">{{ t('inventory.stockLevel') }}</th>
                            <th class="px-6 py-4">{{ t('inventory.status') }}</th>
                            <th class="px-6 py-4">{{ t('inventory.lastRestock') }}</th>
                            <th class="px-6 py-4 text-right">{{ t('common.actions') }}</th>
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
                                    <div class="flex items-center gap-3">
                                        <!-- Inline Quantity Slider Card -->
                                        <div class="flex items-center gap-3 bg-gray-50/50 p-2 rounded-2xl border border-gray-100 shadow-sm transition-all group-hover:bg-white group-hover:border-green-200 group-hover:shadow-md">
                                            <div class="flex flex-col gap-1">
                                                <div class="relative w-48 h-4 flex items-center">
                                                    <input 
                                                        v-model.number="inlineQuantities[item.id]" 
                                                        type="range" 
                                                        min="0" 
                                                        :max="Math.max(item.minQuantity * 10, 100, item.quantity * 2)" 
                                                        class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-500 z-10"
                                                    >
                                                    <!-- Indicators for 1/4 and 1/2 -->
                                                    <div class="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 flex items-end pointer-events-none px-0.5 opacity-20">
                                                        <div class="h-2.5 w-0.5 bg-gray-400"></div> <!-- 0 -->
                                                        <div class="h-2 w-px bg-gray-400 ml-[25%] -translate-x-1/2"></div> <!-- 1/4 -->
                                                        <div class="h-2.5 w-px bg-gray-400 ml-[25%] -translate-x-1/2"></div> <!-- 1/2 -->
                                                        <div class="h-2 w-px bg-gray-400 ml-[25%] -translate-x-1/2"></div> <!-- 3/4 -->
                                                        <div class="h-2.5 w-0.5 bg-gray-400 ml-auto"></div> <!-- 1 -->
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex items-center gap-2 border-l border-gray-200 pl-3">
                                                <input 
                                                    v-model.number="inlineQuantities[item.id]" 
                                                    type="number" 
                                                    class="w-10 text-center text-xs font-black bg-green-50/50 rounded-lg py-1 border-0 focus:ring-1 focus:ring-green-500"
                                                >
                                                <div class="w-[50px] flex justify-center">
                                                    <button 
                                                        @click="handleInlineSave(item.id)"
                                                        v-show="inlineQuantities[item.id] !== item.quantity"
                                                        class="px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-green-700 transition-all active:scale-95 flex items-center gap-1"
                                                    >
                                                        {{ t('common.save') }}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Edit/Delete Action Icons -->
                                        <div class="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                                            <button 
                                                @click="openEditModal(item)" 
                                                class="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                :title="t('inventory.editItem')"
                                            >
                                                <Edit class="w-4 h-4" />
                                            </button>
                                            <button 
                                                v-if="!isBaker" 
                                                @click="handleDelete(item.id)" 
                                                class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                :title="t('common.delete')"
                                            >
                                                <Trash2 class="w-4 h-4" />
                                            </button>
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
                        {{ editingItem ? t('inventory.editInventoryItem') : t('inventory.newInventoryItem') }}
                    </h2>
                    <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600">
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-gray-700">{{ t('inventory.itemName') }}</label>
                        <input v-model="form.name" type="text" :disabled="isBaker" required class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ t('inventory.category') }}</label>
                            <input v-if="isBaker" v-model="form.category" disabled class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 text-gray-500 font-medium">
                            <select v-else v-model="form.category" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white font-medium">
                                <option value="Pastries">Pastries</option>
                                <option value="Bread">Bread</option>
                                <option value="Cakes">Cakes</option>
                                <option value="Cookies">Cookies</option>
                                <option value="Donuts">Donuts</option>
                                <option value="Beverages">Beverages</option>
                                <option value="Packaging">Packaging</option>
                                <option value="Supplies">Supplies</option>
                            </select>
                        </div>
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ t('inventory.unit') }}</label>
                            <input v-model="form.unit" type="text" :disabled="isBaker" required placeholder="e.g. kg" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ t('inventory.currentQuantity') }}</label>
                            <div class="relative">
                                <input 
                                    v-model.number="form.quantity" 
                                    type="number" 
                                    step="0.1" 
                                    required 
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold"
                                >
                                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {{ form.unit || 'pcs' }}
                                </span>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ t('inventory.minStockAlert') }}</label>
                            <div class="relative">
                                <input v-model.number="form.minQuantity" type="number" :disabled="isBaker" step="0.1" required class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500">
                                <AlertTriangle class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-6 border-t border-gray-50 mt-6">
                        <button type="button" @click="isModalOpen = false" class="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                            {{ t('common.cancel') }}
                        </button>
                        <button type="submit" class="px-8 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md transition-all active:scale-95">
                            {{ editingItem ? t('common.save') : t('inventory.addNewItem') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
