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

    <!-- Current & Upcoming Sales -->
    <div v-if="activeAndUpcomingSales.length > 0" class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-1.5 h-6 bg-bakery-600 rounded-full"></div>
        <h2 class="text-xl font-black text-gray-900 tracking-tight">Active & Scheduled</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="sale in activeAndUpcomingSales" :key="sale.id" class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div class="p-5 border-b border-gray-50">
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-bold text-lg text-gray-900">{{ sale.name }}</h3>
              <span :class="getStatusBadgeClass(sale)" class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {{ getStatusLabel(sale) }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span class="w-4 text-xs">📅</span> {{ formatDate(sale.start_time) }}
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="w-4 text-xs">🏁</span> {{ formatDate(sale.end_time) }}
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
            <div v-if="getStatusLabel(sale) === 'Active'" class="flex-1 flex gap-2">
              <button
                @click="toggleSale(sale)"
                class="flex-1 py-2 rounded-lg text-xs font-bold border border-yellow-200 text-yellow-600 hover:bg-yellow-50 transition-all bg-white"
              >
                Deactivate
              </button>
              <button
                @click="extendSale(sale)"
                class="flex-1 py-2 rounded-lg text-xs font-bold border border-bakery-200 text-bakery-600 hover:bg-bakery-50 transition-all bg-white"
              >
                +1 Hour
              </button>
            </div>
            <div v-else class="flex-1">
              <button
                @click="toggleSale(sale)"
                class="w-full py-2 rounded-lg text-xs font-bold transition-all border bg-white"
                :class="sale.is_active ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' : 'border-green-200 text-green-600 hover:bg-green-50'"
              >
                {{ sale.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
            <button
              @click="openEditModal(sale)"
              class="px-3 py-2 rounded-lg border border-bakery-100 text-bakery-600 hover:bg-bakery-50 transition-all bg-white"
              title="Edit Sale Info"
            >
              📝
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Past Sales Section -->
    <div v-if="pastSales.length > 0" class="space-y-6 pt-12 border-t border-gray-100">
      <div class="flex items-center gap-3 opacity-60">
        <div class="w-1.5 h-6 bg-gray-400 rounded-full"></div>
        <h2 class="text-xl font-black text-gray-500 tracking-tight">Past Events</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
        <div v-for="sale in pastSales" :key="sale.id" class="bg-white/60 rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all grayscale-20 hover:grayscale-0">
          <div class="p-5 border-b border-gray-50 bg-gray-50/50">
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-bold text-lg text-gray-400">{{ sale.name }}</h3>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-200 text-gray-500">
                Ended
              </span>
            </div>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ended on {{ formatDate(sale.end_time) }}</p>
          </div>

          <div class="p-5 space-y-3">
             <div v-for="item in sale.items" :key="item.id || item.product_id" class="flex items-center gap-3 opacity-60">
                <p class="text-xs font-bold text-gray-600 truncate">{{ item.name }}</p>
                <div class="flex-1 h-px bg-gray-100"></div>
                <p class="text-[10px] font-bold text-gray-500">{{ item.sold_quantity }} Sold</p>
             </div>
          </div>

          <div class="p-4 bg-gray-50/50 flex justify-between gap-3">
            <button
              @click="duplicateSale(sale)"
              class="flex-1 py-2.5 rounded-xl text-xs font-black bg-bakery-900 text-white hover:bg-black transition-all shadow-lg shadow-bakery-100/50"
            >
              Rerun This Sale
            </button>
            <button
              @click="openEditModal(sale)"
              class="px-3 py-2 rounded-xl border border-gray-100 text-bakery-600 hover:bg-white transition-all shadow-sm"
              title="Edit Sale Info"
            >
              📝
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isModalOpen = false"></div>
      <div class="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div class="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black text-gray-900">{{ isEditMode ? 'Edit Flash Sale' : 'Create New Flash Sale' }}</h2>
            <p class="text-gray-500">Define the schedule and pick products to discount</p>
          </div>
          <button v-if="isEditMode" @click="deleteSale(editingSaleId)" class="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 p-2 rounded-lg hover:bg-red-50">
            🗑️ Delete Sale
          </button>
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
            <div v-if="newSale.start_time && newSale.end_time && new Date(newSale.end_time) <= new Date(newSale.start_time)" class="md:col-span-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
              <span>⚠️</span> End time must be after start time.
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
            @click="saveSale"
            :disabled="!isFormValid"
            class="px-8 py-3 rounded-xl bg-bakery-900 text-white font-bold hover:bg-black transition-all disabled:opacity-30 shadow-xl shadow-bakery-200"
          >
            {{ isEditMode ? 'Update Flash Sale' : 'Create Flash Sale' }}
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
const isEditMode = ref(false);
const editingSaleId = ref(null);
const isDropdownOpen = ref(false);
const productSearch = ref('');

const newSale = ref({
  name: '',
  start_time: '',
  end_time: '',
  items: []
});

import { API_URL } from '../config/api';

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
    isEditMode.value = false;
    editingSaleId.value = null;
    newSale.value = {
        name: '',
        start_time: '',
        end_time: '',
        items: []
    };
    isModalOpen.value = true;
};

const openEditModal = (sale) => {
    isEditMode.value = true;
    editingSaleId.value = sale.id;

    // Format to YYYY-MM-DDThh:mm for datetime-local
    const formatDateForInput = (dStr) => {
        const d = new Date(dStr);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    newSale.value = {
        name: sale.name,
        start_time: formatDateForInput(sale.start_time),
        end_time: formatDateForInput(sale.end_time),
        items: sale.items.map(item => ({
            product_id: item.product_id,
            sale_price: item.sale_price,
            flash_sale_stock: item.flash_sale_stock,
            sold_quantity: item.sold_quantity
        }))
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

const activeAndUpcomingSales = computed(() => {
    return flashSales.value.filter(s => getStatusLabel(s) !== 'Ended');
});

const pastSales = computed(() => {
    return flashSales.value.filter(s => getStatusLabel(s) === 'Ended');
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
    const hasRequiredFields = newSale.value.name &&
           newSale.value.start_time &&
           newSale.value.end_time &&
           newSale.value.items.length > 0;
    if (!hasRequiredFields) return false;

    return new Date(newSale.value.end_time) > new Date(newSale.value.start_time);
});

const saveSale = async () => {
    try {
        const token = localStorage.getItem('token');
        const saleData = {
            ...newSale.value,
            start_time: new Date(newSale.value.start_time).toISOString(),
            end_time: new Date(newSale.value.end_time).toISOString()
        };

        const url = isEditMode.value ? `${API_URL}/flash-sales/${editingSaleId.value}` : `${API_URL}/flash-sales`;
        const method = isEditMode.value ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(saleData)
        });

        if (response.ok) {
            await fetchFlashSales();
            isModalOpen.value = false;
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to save flash sale');
        }
    } catch (err) {
        alert('Server error saving flash sale');
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

const duplicateSale = (sale) => {
    const now = new Date();
    const start = new Date(now.getTime() + 5 * 60 * 1000); // 5 mins from now
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    // Format to YYYY-MM-DDThh:mm
    const formatDateForInput = (d) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    newSale.value = {
        name: `${sale.name} (Copy)`,
        start_time: formatDateForInput(start),
        end_time: formatDateForInput(end),
        items: sale.items.map(item => ({
            product_id: item.product_id,
            sale_price: item.sale_price,
            flash_sale_stock: item.flash_sale_stock
        }))
    };
    isModalOpen.value = true;
};

const extendSale = async (sale) => {
    try {
        const currentEnd = new Date(sale.end_time);
        const now = new Date();
        const baseTime = currentEnd < now ? now : currentEnd;
        const newEnd = new Date(baseTime.getTime() + 60 * 60 * 1000); // +1 hour

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/flash-sales/${sale.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                end_time: newEnd.toISOString(),
                // Refresh items: reset sold_quantity to 0 but keep same prices/stock
                items: sale.items.map(item => ({
                    product_id: item.product_id,
                    sale_price: item.sale_price,
                    flash_sale_stock: item.flash_sale_stock,
                    sold_quantity: 0
                }))
            })
        });
        if (response.ok) await fetchFlashSales();
    } catch (err) {
        console.error('Failed to extend sale:', err);
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
