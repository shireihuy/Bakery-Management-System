<template>
  <div class="p-8 space-y-8 bg-gray-50 min-h-screen">
    <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Flash Sale Manager</h1>
        <p class="text-gray-500 mt-1">Schedule and monitor limited-time bakery events</p>
      </div>
      <button 
        @click="openCreateModal"
        class="bg-bakery-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-bakery-700 transition-all shadow-lg shadow-bakery-100"
      >
        <span class="text-xl">+</span> New Flash Sale
      </button>
    </div>

    <!-- Active & Scheduled Sales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="sale in flashSales" :key="sale.id" class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div class="p-5 border-b border-gray-50">
          <div class="flex justify-between items-start mb-3">
            <h3 class="font-bold text-lg text-gray-900">{{ sale.name }}</h3>
            <span :class="getStatusBadgeClass(sale)" class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {{ getStatusLabel(sale) }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span class="w-4">📅</span> {{ formatDate(sale.start_time) }}
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span class="w-4">🏁</span> {{ formatDate(sale.end_time) }}
          </div>
        </div>
        
        <div class="p-5 space-y-4">
          <div v-for="item in sale.items" :key="item.id || item.product_id" class="flex items-center gap-3">
            <img :src="item.image || getProductImage(item.product_id)" class="w-10 h-10 rounded-lg object-cover" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate">{{ item.name }}</p>
              <div class="flex items-center gap-2">
                <span class="text-xs text-green-600 font-black">${{ parseFloat(item.sale_price).toFixed(2) }}</span>
                <span class="text-[10px] text-gray-400 line-through">${{ parseFloat(item.original_price).toFixed(2) }}</span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-bold text-gray-500 uppercase">{{ item.sold_quantity }} / {{ item.flash_sale_stock }}</p>
              <div class="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <div class="h-full bg-bakery-600" :style="{ width: (item.sold_quantity / item.flash_sale_stock * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-5 bg-gray-50 flex justify-between gap-3">
          <button 
            @click="toggleSale(sale)" 
            class="flex-1 py-2 rounded-lg text-xs font-bold transition-all border"
            :class="sale.is_active ? 'bg-white border-yellow-200 text-yellow-600 hover:bg-yellow-50' : 'bg-white border-green-200 text-green-600 hover:bg-green-50'"
          >
            {{ sale.is_active ? 'Deactivate' : 'Activate' }}
          </button>
          <button @click="deleteSale(sale.id)" class="px-3 py-2 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-all">
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isModalOpen = false"></div>
      <div class="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div class="p-8 border-b border-gray-100">
          <h2 class="text-2xl font-black text-gray-900">Create New Flash Sale</h2>
          <p class="text-gray-500">Define the schedule and pick products to discount</p>
        </div>
        
        <div class="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest">Event Name</label>
              <input v-model="newSale.name" type="text" class="w-full h-12 rounded-xl border border-gray-100 px-4 focus:ring-2 focus:ring-bakery-300" placeholder="e.g., Midnight Matcha" />
            </div>
            <div class="space-y-2 relative">
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest">Add Product</label>
              <div class="relative">
                <div class="flex items-center bg-white rounded-xl border border-gray-100 px-4 focus-within:ring-2 focus-within:ring-bakery-300 transition-all">
                  <span class="text-gray-400">🔍</span>
                  <input 
                    type="text" 
                    v-model="productSearch" 
                    @focus="isDropdownOpen = true"
                    class="w-full h-12 bg-transparent border-none focus:ring-0 text-sm outline-none" 
                    placeholder="Search available products..." 
                  />
                </div>
                
                <!-- Custom Dropdown -->
                <div v-if="isDropdownOpen && filteredAvailableProducts.length > 0" 
                     class="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  <div 
                    v-for="p in filteredAvailableProducts" 
                    :key="p.id" 
                    @click="selectProduct(p)"
                    class="p-3 hover:bg-bakery-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <img :src="p.image" class="w-10 h-10 rounded-lg object-cover shadow-sm" />
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-gray-900 text-sm truncate">{{ p.name }}</p>
                      <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">${{ p.price }}</p>
                    </div>
                    <div class="text-bakery-600 font-bold text-lg">+</div>
                  </div>
                </div>
                
                <!-- Backdrop to close dropdown -->
                <div v-if="isDropdownOpen" @click="isDropdownOpen = false" class="fixed inset-0 z-10"></div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest">Start Time</label>
              <input v-model="newSale.start_time" type="datetime-local" class="w-full h-12 rounded-xl border border-gray-100 px-4 focus:ring-2 focus:ring-bakery-300" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest">End Time</label>
              <input v-model="newSale.end_time" type="datetime-local" class="w-full h-12 rounded-xl border border-gray-100 px-4 focus:ring-2 focus:ring-bakery-300" />
            </div>
          </div>

          <!-- Selected Products List -->
          <div v-if="newSale.items.length > 0" class="space-y-4">
            <label class="text-xs font-black text-gray-400 uppercase tracking-widest">Item Settings</label>
            <div v-for="(item, index) in newSale.items" :key="item.product_id" class="p-4 bg-gray-50 rounded-2xl flex flex-wrap items-center gap-4 border border-gray-100">
              <img :src="getProductImage(item.product_id)" class="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-200" />
              <div class="flex-1 min-w-[150px]">
                <p class="font-bold text-gray-900">{{ getProductName(item.product_id) }}</p>
                <p class="text-xs text-gray-400">Regular: ${{ getProductPrice(item.product_id) }}</p>
              </div>
              <div class="w-32">
                <label class="text-[10px] font-black text-gray-400 uppercase">Sale Price</label>
                <input v-model="item.sale_price" type="number" step="0.01" class="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-bold" />
              </div>
              <div class="w-32">
                <label class="text-[10px] font-black text-gray-400 uppercase">Sale Stock</label>
                <input v-model="item.flash_sale_stock" type="number" class="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-bold" />
              </div>
              <button @click="removeItem(index)" class="text-red-400 hover:text-red-600 px-2">✕</button>
            </div>
          </div>
        </div>

        <div class="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button @click="isModalOpen = false" class="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-white transition-all">Cancel</button>
          <button 
            @click="createSale" 
            :disabled="!isFormValid"
            class="px-8 py-3 rounded-xl bg-bakery-900 text-white font-bold hover:bg-black transition-all disabled:opacity-30 shadow-xl shadow-bakery-200"
          >
            Create Flash Sale
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProducts } from '../composables/useProducts';

const { products, fetchProducts } = useProducts();
const flashSales = ref([]);
const isModalOpen = ref(false);
const isDropdownOpen = ref(false);
const productSearch = ref('');

const newSale = ref({
  name: '',
  start_time: '',
  end_time: '',
  items: []
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const fetchFlashSales = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/flash-sales`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            // Map image paths to full URLs if they are relative paths from the server
            flashSales.value = data.map((sale) => ({
                ...sale,
                items: sale.items.map((item) => ({
                    ...item,
                    image: item.image?.startsWith('/') ? `${API_URL.replace('/api', '')}${item.image}` : item.image
                }))
            }));
        }
    } catch (err) {
        console.error('Failed to fetch flash sales:', err);
    }
};

const openCreateModal = () => {
    newSale.value = {
        name: '',
        start_time: '',
        end_time: '',
        items: []
    };
    isModalOpen.value = true;
};

const selectProduct = (product) => {
    const productId = parseInt(product.id);
    if (newSale.value.items.some(i => i.product_id === productId)) return;
    
    newSale.value.items.push({
        product_id: productId,
        sale_price: (product.price * 0.5).toFixed(2),
        flash_sale_stock: 10
    });
    productSearch.value = '';
    isDropdownOpen.value = false;
};

const removeItem = (index) => {
    newSale.value.items.splice(index, 1);
};

const getProductName = (id) => products.value.find(p => parseInt(p.id) === id)?.name || 'Unknown';
const getProductPrice = (id) => products.value.find(p => parseInt(p.id) === id)?.price || 0;
const getProductImage = (id) => products.value.find(p => parseInt(p.id) === id)?.image || '';

const availableProducts = computed(() => {
    return products.value.filter(p => !newSale.value.items.some(i => i.product_id === parseInt(p.id)));
});

const filteredAvailableProducts = computed(() => {
    if (!productSearch.value) return availableProducts.value;
    const query = productSearch.value.toLowerCase();
    return availableProducts.value.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );
});

const isFormValid = computed(() => {
    return newSale.value.name && 
           newSale.value.start_time && 
           newSale.value.end_time && 
           newSale.value.items.length > 0;
});

const createSale = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/flash-sales`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(newSale.value)
        });
        
        if (response.ok) {
            await fetchFlashSales();
            isModalOpen.value = false;
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to create flash sale');
        }
    } catch (err) {
        alert('Server error creating flash sale');
    }
};

const toggleSale = async (sale) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/flash-sales/${sale.id}/toggle`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ is_active: !sale.is_active })
        });
        if (response.ok) await fetchFlashSales();
    } catch (err) {
        console.error('Failed to toggle sale:', err);
    }
};

const deleteSale = async (id) => {
    if (!confirm('Are you sure you want to delete this flash sale?')) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/flash-sales/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) await fetchFlashSales();
    } catch (err) {
        console.error('Failed to delete sale:', err);
    }
};

const getStatusLabel = (sale) => {
    const now = new Date();
    const start = new Date(sale.start_time);
    const end = new Date(sale.end_time);
    
    if (!sale.is_active) return 'Inactive';
    if (now < start) return 'Scheduled';
    if (now > end) return 'Ended';
    return 'Active';
};

const getStatusBadgeClass = (sale) => {
    const status = getStatusLabel(sale);
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-700';
        case 'Scheduled': return 'bg-blue-100 text-blue-700';
        case 'Ended': return 'bg-gray-100 text-gray-700';
        default: return 'bg-red-100 text-red-700';
    }
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

onMounted(async () => {
    await fetchProducts();
    await fetchFlashSales();
});
</script>

<style scoped>
.bg-bakery-600 { background-color: #4a6741; }
.bg-bakery-900 { background-color: #2c3e26; }
.text-bakery-600 { color: #4a6741; }
.shadow-bakery-100 { box-shadow: 0 4px 14px 0 rgba(74, 103, 65, 0.1); }
.shadow-bakery-200 { box-shadow: 0 4px 20px 0 rgba(74, 103, 65, 0.2); }

</style>
