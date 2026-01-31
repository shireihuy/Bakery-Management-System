<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X 
} from 'lucide-vue-next';
import { useProducts, type Product } from '../composables/useProducts';

const { products, addProduct, updateProduct, deleteProduct, fetchProducts } = useProducts();

import { onMounted } from 'vue';

onMounted(async () => {
    await fetchProducts();
});

const isDialogOpen = ref(false);
const editingProduct = ref<Product | null>(null);
const searchTerm = ref('');
const filterCategory = ref('all');

const formData = ref({
    name: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    unit: 'pcs',
    image: '',
    description: '',
    ingredients: '',
    allergens: '',
    rating: ''
});

const selectedFile = ref<File | null>(null);
const imagePreview = ref('');

const onFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        selectedFile.value = target.files[0];
        imagePreview.value = URL.createObjectURL(target.files[0]);
    }
};

const categories = ['Bread', 'Pastries', 'Cookies', 'Muffins', 'Pies', 'Cakes', 'Beverages'];
const units = ['pcs', 'loaf', 'whole', 'dozen', 'cup'];

const resetForm = () => {
    formData.value = { 
        name: '', 
        category: '', 
        price: '', 
        cost: '', 
        stock: '', 
        unit: 'pcs', 
        image: '', 
        description: '', 
        ingredients: '', 
        allergens: '', 
        rating: '' 
    };
    editingProduct.value = null;
    selectedFile.value = null;
    imagePreview.value = '';
};

const handleEdit = (product: Product) => {
    editingProduct.value = product;
    formData.value = {
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        cost: product.cost?.toString() || '',
        stock: product.stock.toString(),
        unit: product.unit || 'pcs',
        image: product.image,
        description: product.description || '',
        ingredients: product.ingredients?.join(', ') || '',
        allergens: product.allergens?.join(', ') || '',
        rating: product.rating?.toString() || ''
    };
    imagePreview.value = product.image;
    isDialogOpen.value = true;
};

const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(id);
    }
};

const handleSubmit = async () => {
    const productData = {
        name: formData.value.name,
        category: formData.value.category,
        price: formData.value.price,
        cost: formData.value.cost,
        stock: formData.value.stock,
        unit: formData.value.unit,
        description: formData.value.description,
        // Send file if selected, otherwise send existing image URL string
        image: selectedFile.value || formData.value.image,
        ingredients: formData.value.ingredients,
        allergens: formData.value.allergens,
        rating: formData.value.rating
    };

    try {
        if (editingProduct.value) {
            await updateProduct(editingProduct.value.id, productData);
        } else {
            await addProduct(productData);
        }
        isDialogOpen.value = false;
        resetForm();
    } catch (err) {
        alert('Error saving product');
    }
};

const filteredProducts = computed(() => {
    return products.value.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.value.toLowerCase());
        const matchesCategory = filterCategory.value === 'all' || product.category === filterCategory.value;
        return matchesSearch && matchesCategory;
    });
});
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <div class="glass-card rounded-[2.5rem] border border-bakery-100 dark:border-bakery-800 overflow-hidden">
      <div class="p-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 class="text-3xl font-black tracking-tight text-bakery-900 dark:text-white">Artisan Inventory</h2>
            <p class="text-bakery-500 dark:text-bakery-400 font-medium mt-1">Manage and curate your bakery's finest selections.</p>
          </div>
          <button 
            @click="() => { resetForm(); isDialogOpen = true; }"
            class="h-14 px-8 rounded-2xl bg-bakery-900 dark:bg-white text-white dark:text-bakery-900 font-black text-sm flex items-center shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <Plus class="w-5 h-5 mr-3" />
            New Creation
          </button>
        </div>

        <div class="flex flex-col md:flex-row gap-6 mb-10">
            <div class="relative flex-1 group">
              <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bakery-400 group-focus-within:text-bakery-600 dark:group-focus-within:text-bakery-400 transition-colors" />
              <input
                placeholder="Search by name, ingredients..."
                v-model="searchTerm"
                class="w-full h-14 pl-12 pr-6 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-white/50 dark:bg-bakery-950/50 backdrop-blur-sm transition-all text-bakery-900 dark:text-white font-medium"
              />
            </div>
            <div class="relative w-full md:w-64">
                <select 
                    v-model="filterCategory"
                    class="w-full h-14 px-6 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-white/50 dark:bg-bakery-950/50 text-sm font-black uppercase tracking-widest text-bakery-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-bakery-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
                v-for="product in filteredProducts" 
                :key="product.id" 
                class="group bg-white dark:bg-bakery-900 rounded-[2.5rem] border border-bakery-100 dark:border-bakery-800 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
                <div class="relative h-56 overflow-hidden">
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bakery-900/60 to-transparent"></div>
                  <span class="absolute top-4 right-4 glass-card px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-bakery-700 dark:text-bakery-300 border border-white/20">{{ product.category }}</span>
                </div>
                <div class="p-8">
                  <div class="space-y-6">
                    <div class="flex justify-between items-start">
                      <div class="min-w-0 flex-1">
                        <h4 class="text-xl font-black text-bakery-900 dark:text-white truncate group-hover:text-bakery-600 dark:group-hover:text-bakery-400 transition-colors">{{ product.name }}</h4>
                        <p class="text-xs text-bakery-400 dark:text-bakery-500 font-bold uppercase tracking-widest mt-1">ID: #{{ product.id.slice(0, 8) }}</p>
                      </div>
                      <div class="flex gap-2 ml-4">
                        <button
                          @click="handleEdit(product)"
                          class="w-10 h-10 rounded-xl border border-bakery-100 dark:border-bakery-800 text-bakery-600 dark:text-bakery-400 hover:bg-bakery-50 dark:hover:bg-bakery-800 transition-all flex items-center justify-center shadow-sm"
                        >
                          <Edit class="w-4 h-4" />
                        </button>
                        <button
                          @click="handleDelete(product.id)"
                           class="w-10 h-10 rounded-xl bg-danger-bg hover:bg-danger-text/20 text-danger-text border border-danger-text/10 transition-all flex items-center justify-center shadow-sm"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-6 p-6 bg-bakery-50/50 dark:bg-bakery-950/50 rounded-3xl border border-bakery-50 dark:border-bakery-800">
                      <div>
                        <p class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest mb-1">Bakery Price</p>
                        <p class="text-lg font-black text-bakery-900 dark:text-white">${{ product.price.toFixed(2) }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest mb-1">Current Stock</p>
                        <p :class="`text-lg font-black ${product.stock < 10 ? 'text-danger-text' : 'text-bakery-900 dark:text-white'}`">{{ product.stock }} <span class="text-xs opacity-50">{{ product.unit }}</span></p>
                      </div>
                      <div class="col-span-2 pt-4 border-t border-bakery-100 dark:border-bakery-800 flex justify-between items-center">
                          <span class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Profit Margin</span>
                          <span class="text-sm font-black text-success-text">
                             +{{ product.cost && product.cost > 0 ? (((product.price - product.cost) / product.cost) * 100).toFixed(0) : '100' }}%
                          </span>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        </div>
        
         <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div class="w-20 h-20 rounded-full bg-bakery-50 dark:bg-bakery-900 flex items-center justify-center">
                <Search class="w-10 h-10 text-bakery-200 dark:text-bakery-800" />
            </div>
            <p class="text-bakery-500 font-medium tracking-tight">No creations match your search criteria.</p>
         </div>
      </div>
    </div>

    <!-- Product Dialog (Modal) -->
    <div v-if="isDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-bakery-950/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div class="bg-white dark:bg-bakery-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-bakery-100 dark:border-bakery-800">
            <div class="p-8 border-b border-bakery-50 dark:border-bakery-800 flex justify-between items-center bg-bakery-50/50 dark:bg-bakery-950/50">
                <div>
                     <h3 class="text-2xl font-black text-bakery-900 dark:text-white tracking-tight">{{ editingProduct ? 'Edit Creation' : 'New Artisan Creation' }}</h3>
                     <p class="text-sm text-bakery-500 dark:text-bakery-400 font-medium mt-1">Refine the details of your bakery products.</p>
                </div>
                <button @click="isDialogOpen = false" class="w-12 h-12 rounded-2xl bg-white dark:bg-bakery-800 border border-bakery-100 dark:border-bakery-700 text-bakery-400 hover:text-bakery-900 dark:hover:text-white flex items-center justify-center transition-all">
                    <X class="w-6 h-6" />
                </button>
            </div>
            
            <div class="p-8 overflow-y-auto scrollbar-hide">
                <form @submit.prevent="handleSubmit" class="space-y-8">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-3">
                        <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Product Name</label>
                        <input
                          v-model="formData.name"
                          required
                          placeholder="e.g. Traditional Matcha Croissant"
                          class="w-full h-12 px-5 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-bakery-50/50 dark:bg-bakery-950/50 text-sm font-medium text-bakery-900 dark:text-white"
                        />
                    </div>
                    <div class="space-y-3">
                        <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Category</label>
                        <select 
                            v-model="formData.category"
                            class="w-full h-12 px-5 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-bakery-50/50 dark:bg-bakery-950/50 text-sm font-black uppercase tracking-widest text-bakery-900 dark:text-white"
                        >
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        v-model="formData.cost"
                        required
                        class="w-full h-12 px-5 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-bakery-50/50 dark:bg-bakery-950/50 text-sm font-medium text-bakery-900 dark:text-white"
                      />
                    </div>
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        v-model="formData.price"
                        required
                        class="w-full h-12 px-5 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-bakery-50/50 dark:bg-bakery-950/50 text-sm font-medium text-bakery-900 dark:text-white"
                      />
                    </div>
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Stock</label>
                      <input
                        type="number"
                        v-model="formData.stock"
                        required
                        class="w-full h-12 px-5 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-bakery-50/50 dark:bg-bakery-950/50 text-sm font-medium text-bakery-900 dark:text-white"
                      />
                    </div>
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Unit</label>
                      <select 
                        v-model="formData.unit"
                        class="w-full h-12 px-5 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-bakery-50/50 dark:bg-bakery-950/50 text-sm font-black uppercase tracking-widest text-bakery-900 dark:text-white"
                      >
                         <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                      </select>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Visual Presentation</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div v-if="imagePreview" class="relative group h-48 rounded-3xl overflow-hidden border border-bakery-100 dark:border-bakery-800">
                            <img :src="imagePreview" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button 
                                    @click.prevent="() => { selectedFile = null; imagePreview = ''; formData.image = ''; }"
                                    class="w-12 h-12 rounded-2xl bg-danger-text text-white flex items-center justify-center hover:scale-110 transition-all shadow-xl"
                                >
                                    <Trash2 class="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div v-else class="h-48 rounded-3xl border-2 border-dashed border-bakery-100 dark:border-bakery-800 bg-bakery-50/30 dark:bg-bakery-950/30 hover:bg-bakery-50/50 dark:hover:bg-bakery-900/50 transition-all">
                            <label class="flex flex-col items-center justify-center h-full cursor-pointer space-y-3">
                                <Plus class="w-10 h-10 text-bakery-200 dark:text-bakery-800" />
                                <span class="text-xs font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Upload Image</span>
                                <input type="file" class="hidden" accept="image/*" @change="onFileChange" />
                            </label>
                        </div>
                        <div class="flex flex-col justify-center space-y-4">
                            <p class="text-xs text-bakery-500 dark:text-bakery-400 font-medium">Or provide an external high-resolution URL:</p>
                            <input
                              v-model="formData.image"
                              placeholder="https://images.unsplash.com/..."
                              class="w-full h-12 px-5 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-bakery-50/50 dark:bg-bakery-950/50 text-sm font-medium text-bakery-900 dark:text-white"
                            />
                        </div>
                    </div>
                  </div>

                   <div class="space-y-3">
                    <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Artisan Description</label>
                     <textarea
                      v-model="formData.description"
                      required
                      placeholder="Describe the texture, flavor notes, and inspiration..."
                      class="w-full min-h-[120px] p-5 rounded-3xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-bakery-50/50 dark:bg-bakery-950/50 text-sm font-medium text-bakery-900 dark:text-white leading-relaxed"
                    />
                  </div>

                   <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Ingredients</label>
                             <textarea
                              v-model="formData.ingredients"
                              placeholder="Wheat flour, organic matcha, sea salt..."
                              class="w-full min-h-[100px] p-5 rounded-3xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-bakery-50/50 dark:bg-bakery-950/50 text-sm font-medium text-bakery-900 dark:text-white"
                            />
                        </div>
                        <div class="space-y-3">
                            <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Allergens</label>
                             <textarea
                              v-model="formData.allergens"
                              placeholder="Dairy, Eggs, Gluten..."
                              class="w-full min-h-[100px] p-5 rounded-3xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-bakery-50/50 dark:bg-bakery-950/50 text-sm font-medium text-bakery-900 dark:text-white"
                            />
                        </div>
                   </div>

                   <div class="flex items-center justify-between p-6 bg-bakery-50/50 dark:bg-bakery-950/50 rounded-3xl border border-bakery-50 dark:border-bakery-800">
                        <div class="space-y-1">
                            <p class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Customer Rating</p>
                            <p class="text-xs text-bakery-500 dark:text-bakery-400 font-medium">Initial quality score (0.0 - 5.0)</p>
                        </div>
                        <input
                          v-model="formData.rating"
                          type="number"
                          step="0.1"
                          max="5"
                          class="w-24 h-12 px-5 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-white dark:bg-bakery-800 text-sm font-black text-bakery-900 dark:text-white text-center"
                        />
                  </div>
                  
                  <div class="flex gap-4 pt-4">
                      <button 
                        type="button"
                        @click="isDialogOpen = false"
                        class="flex-1 h-14 rounded-2xl border border-bakery-100 dark:border-bakery-800 text-bakery-900 dark:text-white font-black text-sm uppercase tracking-widest hover:bg-bakery-50 dark:hover:bg-bakery-800 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        class="flex-[2] h-14 rounded-2xl bg-bakery-900 dark:bg-white text-white dark:text-bakery-900 font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all active:scale-95"
                      >
                        {{ editingProduct ? 'Save Changes' : 'Publish Creation' }}
                      </button>
                  </div>
                </form>
            </div>
        </div>
    </div>
  </div>

</template>
