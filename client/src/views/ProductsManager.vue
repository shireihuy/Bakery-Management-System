<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X 
} from 'lucide-vue-next';
import { useProducts, type Product } from '../composables/useProducts';
import { useI18n } from '../composables/useI18n';

const { products, addProduct, updateProduct, deleteProduct, fetchProducts, fetchTags } = useProducts();
const { t } = useI18n();

const availableTags = ref<{ ingredients: string[], allergens: string[] }>({ ingredients: [], allergens: [] });

onMounted(async () => {
    await fetchProducts();
    availableTags.value = await fetchTags();
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
    ingredients: [] as string[],
    allergens: [] as string[],
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
        ingredients: [], 
        allergens: [], 
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
        ingredients: [...(product.ingredients || [])],
        allergens: [...(product.allergens || [])],
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
const toggleTag = (type: 'ingredients' | 'allergens', tag: string) => {
    const list = formData.value[type];
    const index = list.indexOf(tag);
    if (index === -1) {
        list.push(tag);
    } else {
        list.splice(index, 1);
    }
};
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-xl border bg-card text-card-foreground shadow border-green-200 bg-white">
      <div class="p-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 class="text-2xl font-bold tracking-tight text-green-900">{{ t('products.productManagement') }}</h2>
          <button 
            @click="() => { resetForm(); isDialogOpen = true; }"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
          >
            <Plus class="w-4 h-4 mr-2" />
            {{ t('products.addProduct') }}
          </button>
        </div>

        <div class="flex flex-col md:flex-row gap-4 mb-6">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              <input
                :placeholder="t('products.searchProducts')"
                v-model="searchTerm"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <select 
                v-model="filterCategory"
                class="flex h-10 w-full md:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-green-200 focus:border-green-500 focus:ring-green-500"
            >
              <option value="all">{{ t('products.allCategories') }}</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
                v-for="product in filteredProducts" 
                :key="product.id" 
                class="rounded-xl border bg-card text-card-foreground shadow border-green-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
            >
                <div class="relative h-40 overflow-hidden bg-green-50/30 flex items-center justify-center">
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="w-full h-full object-contain"
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
                      <div class="col-span-2">
                        <p class="text-green-600 text-xs">{{ t('products.price') }}</p>
                        <p class="text-green-900 font-medium">${{ product.price.toFixed(2) }}</p>
                      </div>
                      <div>
                        <p class="text-green-600 text-xs">{{ t('products.stock') }}</p>
                        <p class="text-green-900 font-medium">{{ product.stock }} {{ product.unit }}</p>
                      </div>
                    </div>
                    <div v-if="product.ingredients?.length" class="flex flex-wrap gap-1">
                        <span v-for="tag in product.ingredients.slice(0, 3)" :key="tag" class="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[10px] border border-green-100 italic">{{ tag }}</span>
                        <span v-if="product.ingredients.length > 3" class="text-[10px] text-green-500 font-medium">+{{ product.ingredients.length - 3 }}</span>
                    </div>
                    <div v-if="product.allergens?.length" class="flex flex-wrap gap-1">
                        <span v-for="tag in product.allergens" :key="tag" class="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] border border-red-100 font-medium">{{ tag }}</span>
                    </div>
                  </div>
                </div>
            </div>
        </div>
         <div v-if="filteredProducts.length === 0" class="text-center py-12 text-green-600 italic">
            {{ t('products.noProductsFound') }}
         </div>
      </div>
    </div>

    <!-- Product Dialog (Modal) -->
    <div v-if="isDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
                <div>
                     <h3 class="font-bold text-lg text-green-900">{{ editingProduct ? t('products.editProduct') : t('products.addProduct') }}</h3>
                     <p class="text-sm text-green-600">{{ editingProduct ? t('products.updateProduct') : t('products.addProduct') }}</p>
                </div>
                <button @click="isDialogOpen = false" class="text-gray-400 hover:text-green-600">
                    <X class="w-5 h-5" />
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto space-y-4">
                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <!-- ... rest of form ... -->
                  <div class="space-y-2">
                    <label for="name" class="text-sm font-medium text-gray-700">{{ t('products.productName') }}</label>
                    <input
                      id="name"
                      v-model="formData.name"
                      required
                      class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                  <div class="space-y-2">
                    <label for="category" class="text-sm font-medium text-gray-700">{{ t('products.category') }}</label>
                    <select 
                        id="category"
                        v-model="formData.category"
                        class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-white"
                    >
                        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <!-- Cost field hidden: Not needed by DB yet, reserved for later implementation -->
                    <input type="hidden" v-model="formData.cost" />
                    
                    <div class="space-y-2 col-span-2">
                      <label for="price" class="text-sm font-medium text-gray-700">{{ t('products.price') }} ($)</label>
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
                      <label for="stock" class="text-sm font-medium text-gray-700">{{ t('products.stock') }}</label>
                      <input
                        id="stock"
                        type="number"
                        v-model="formData.stock"
                        required
                        class="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </div>
                    <div class="space-y-2">
                      <label for="unit" class="text-sm font-medium text-gray-700">{{ t('products.unit') }}</label>
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
                    <label for="image" class="text-sm font-medium text-gray-700">{{ t('products.uploadImage') }}</label>
                    <div class="flex flex-col gap-3">
                        <div v-if="imagePreview" class="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                            <img :src="imagePreview" class="w-full h-full object-contain" />
                            <button 
                                @click.prevent="() => { selectedFile = null; imagePreview = ''; formData.image = ''; }"
                                class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md"
                            >
                                <X class="w-4 h-4" />
                            </button>
                        </div>
                        <div v-else class="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <label class="flex flex-col items-center cursor-pointer">
                                <Plus class="w-8 h-8 text-gray-400" />
                                <span class="mt-2 text-sm text-gray-500">{{ t('products.uploadImage') }}</span>
                                <input type="file" class="hidden" accept="image/*" @change="onFileChange" />
                            </label>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">{{ t('products.orUseUrl') }}:</span>
                            <input
                              id="image"
                              v-model="formData.image"
                              placeholder="https://..."
                              class="flex-1 h-8 rounded-md border border-gray-200 bg-background px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                        </div>
                    </div>
                  </div>
                   <div class="space-y-2">
                    <label for="description" class="text-sm font-medium text-gray-700">{{ t('products.description') }}</label>
                     <textarea
                      id="description"
                      v-model="formData.description"
                      required
                      class="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                   <!-- Ingredients and Allergens Tags -->
                   <div class="space-y-4 pt-2">
                       <div class="space-y-2">
                           <label class="text-sm font-medium text-gray-700">{{ t('products.ingredients') }}</label>
                           <div class="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                               <span v-for="tag in formData.ingredients" :key="tag" 
                                   @click="toggleTag('ingredients', tag)"
                                   class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium cursor-pointer hover:bg-green-200 transition-colors"
                               >
                                   {{ tag }} <X class="w-3 h-3" />
                               </span>
                               <span v-if="formData.ingredients.length === 0" class="text-xs text-gray-400 italic py-1">No ingredients selected</span>
                           </div>
                           <div class="flex flex-wrap gap-2">
                               <button v-for="tag in availableTags.ingredients" :key="tag"
                                   type="button"
                                   @click="toggleTag('ingredients', tag)"
                                   :class="[
                                       'px-2 py-1 rounded-md text-xs border transition-all',
                                       formData.ingredients.includes(tag) 
                                           ? 'bg-green-600 border-green-600 text-white shadow-sm' 
                                           : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'
                                   ]"
                               >
                                   {{ tag }}
                               </button>
                           </div>
                       </div>

                       <div class="space-y-2">
                           <label class="text-sm font-medium text-gray-700">{{ t('products.allergens') }}</label>
                           <div class="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                               <span v-for="tag in formData.allergens" :key="tag" 
                                   @click="toggleTag('allergens', tag)"
                                   class="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium cursor-pointer hover:bg-red-200 transition-colors"
                               >
                                   {{ tag }} <X class="w-3 h-3" />
                               </span>
                               <span v-if="formData.allergens.length === 0" class="text-xs text-gray-400 italic py-1">No allergens selected</span>
                           </div>
                           <div class="flex flex-wrap gap-2">
                               <button v-for="tag in availableTags.allergens" :key="tag"
                                   type="button"
                                   @click="toggleTag('allergens', tag)"
                                   :class="[
                                       'px-2 py-1 rounded-md text-xs border transition-all',
                                       formData.allergens.includes(tag) 
                                           ? 'bg-red-600 border-red-600 text-white shadow-sm' 
                                           : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
                                   ]"
                               >
                                   {{ tag }}
                               </button>
                           </div>
                       </div>
                   </div>
                   <div class="space-y-2">
                    <label for="rating" class="text-sm font-medium text-gray-700">{{ t('products.rating') }} (0-5)</label>
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
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg active:scale-[0.98]"
                  >
                    {{ editingProduct ? t('products.updateProduct') : t('products.addProduct') }}
                  </button>
                </form>
            </div>
        </div>
    </div>
  </div>
</template>
