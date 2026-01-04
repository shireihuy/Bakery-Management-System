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
    isDialogOpen.value = true;
};

const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(id);
    }
};

const handleSubmit = () => {
    const productData: Product = {
        id: editingProduct.value ? editingProduct.value.id : Date.now().toString(),
        name: formData.value.name,
        category: formData.value.category,
        price: parseFloat(formData.value.price),
        cost: parseFloat(formData.value.cost),
        stock: parseInt(formData.value.stock),
        unit: formData.value.unit,
        image: formData.value.image,
        description: formData.value.description,
        ingredients: formData.value.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: formData.value.allergens.split(',').map(a => a.trim()).filter(a => a),
        rating: formData.value.rating ? parseFloat(formData.value.rating) : undefined
    };

    if (editingProduct.value) {
        updateProduct(editingProduct.value.id, productData);
    } else {
        addProduct(productData);
    }
    
    isDialogOpen.value = false;
    resetForm();
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
  <div class="space-y-6">
    <div class="rounded-xl border bg-card text-card-foreground shadow border-green-200 bg-white">
      <div class="p-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 class="text-2xl font-bold tracking-tight text-green-900">Product Management</h2>
          <button 
            @click="() => { resetForm(); isDialogOpen = true; }"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
          >
            <Plus class="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>

        <div class="flex flex-col md:flex-row gap-4 mb-6">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              <input
                placeholder="Search products..."
                v-model="searchTerm"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <select 
                v-model="filterCategory"
                class="flex h-10 w-full md:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-green-200 focus:border-green-500 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
                v-for="product in filteredProducts" 
                :key="product.id" 
                class="rounded-xl border bg-card text-card-foreground shadow border-green-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
            >
                <div class="relative h-40 overflow-hidden">
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="w-full h-full object-cover"
                  />
                  <span class="absolute top-2 right-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-600 text-white shadow-sm">{{ product.category }}</span>
                </div>
                <div class="p-4 pt-4">
                  <div class="space-y-3">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <h4 class="text-green-900 font-bold">{{ product.name }}</h4>
                      </div>
                      <div class="flex gap-2">
                        <button
                          @click="handleEdit(product)"
                          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-8 w-8 border-green-200 hover:bg-green-50 text-green-900"
                        >
                          <Edit class="w-4 h-4" />
                        </button>
                        <button
                          @click="handleDelete(product.id)"
                           class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p class="text-green-600 text-xs">Cost</p>
                        <p class="text-green-900 font-medium">${{ product.cost?.toFixed(2) }}</p>
                      </div>
                      <div>
                        <p class="text-green-600 text-xs">Price</p>
                        <p class="text-green-900 font-medium">${{ product.price.toFixed(2) }}</p>
                      </div>
                      <div>
                        <p class="text-green-600 text-xs">Stock</p>
                        <p class="text-green-900 font-medium">{{ product.stock }} {{ product.unit }}</p>
                      </div>
                      <div>
                        <p class="text-green-600 text-xs">Margin</p>
                         <p class="text-green-600 font-medium">
                          {{ product.cost && product.cost > 0 ? (((product.price - product.cost) / product.cost) * 100).toFixed(0) : '100' }}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        </div>
         <div v-if="filteredProducts.length === 0" class="text-center py-12 text-green-600 italic">
            No products found. Try adjusting your filters.
         </div>
      </div>
    </div>

    <!-- Product Dialog (Modal) -->
    <div v-if="isDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
                <div>
                     <h3 class="font-bold text-lg text-green-900">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
                     <p class="text-sm text-green-600">{{ editingProduct ? 'Update product information' : 'Add a new product to your bakery' }}</p>
                </div>
                <button @click="isDialogOpen = false" class="text-gray-400 hover:text-green-600">
                    <X class="w-5 h-5" />
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto space-y-4">
                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <!-- ... rest of form ... -->
                  <div class="space-y-2">
                    <label for="name" class="text-sm font-medium text-gray-700">Product Name</label>
                    <input
                      id="name"
                      v-model="formData.name"
                      required
                      class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                  <div class="space-y-2">
                    <label for="category" class="text-sm font-medium text-gray-700">Category</label>
                    <select 
                        id="category"
                        v-model="formData.category"
                        class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-white"
                    >
                        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label for="cost" class="text-sm font-medium text-gray-700">Cost ($)</label>
                      <input
                        id="cost"
                        type="number"
                        step="0.01"
                        v-model="formData.cost"
                        required
                        class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </div>
                    <div class="space-y-2">
                      <label for="price" class="text-sm font-medium text-gray-700">Price ($)</label>
                      <input
                        id="price"
                        type="number"
                        step="0.01"
                        v-model="formData.price"
                        required
                        class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label for="stock" class="text-sm font-medium text-gray-700">Stock</label>
                      <input
                        id="stock"
                        type="number"
                        v-model="formData.stock"
                        required
                        class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </div>
                    <div class="space-y-2">
                      <label for="unit" class="text-sm font-medium text-gray-700">Unit</label>
                      <select 
                        id="unit"
                        v-model="formData.unit"
                        class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-white"
                      >
                         <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label for="image" class="text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      id="image"
                      v-model="formData.image"
                      required
                      class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                   <div class="space-y-2">
                    <label for="description" class="text-sm font-medium text-gray-700">Description</label>
                     <textarea
                      id="description"
                      v-model="formData.description"
                      required
                      class="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                   <div class="space-y-2">
                    <label for="ingredients" class="text-sm font-medium text-gray-700">Ingredients (comma separated)</label>
                     <textarea
                      id="ingredients"
                      v-model="formData.ingredients"
                      required
                      class="flex min-h-[60px] w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                   <div class="space-y-2">
                    <label for="allergens" class="text-sm font-medium text-gray-700">Allergens (comma separated)</label>
                     <textarea
                      id="allergens"
                      v-model="formData.allergens"
                      required
                      class="flex min-h-[60px] w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                   <div class="space-y-2">
                    <label for="rating" class="text-sm font-medium text-gray-700">Rating (0-5)</label>
                    <input
                      id="rating"
                      v-model="formData.rating"
                      type="number"
                      step="0.1"
                      max="5"
                      required
                      class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg active:scale-[0.98]"
                  >
                    {{ editingProduct ? 'Update Product' : 'Add Product' }}
                  </button>
                </form>
            </div>
        </div>
    </div>
  </div>
</template>
