<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Info, 
  Star, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  History, 
  Clock, 
  XCircle, 
  Eye 
} from 'lucide-vue-next';
import { useProducts, type Product } from '../composables/useProducts';
import { useOrders, type Order } from '../composables/useOrders';
import { useAuth } from '../composables/useAuth';
import { useI18n } from '../composables/useI18n';

// State
const { products, fetchProducts } = useProducts();
const { addOrder, orders, fetchMyOrders, fetchOrders } = useOrders();
const { user } = useAuth();
const { t } = useI18n();
const router = useRouter();

import { onMounted } from 'vue';

onMounted(async () => {
    await fetchProducts();
    if (user.value) {
        if (isCashier.value) {
            await fetchOrders();
        } else {
            await fetchMyOrders();
        }
    }
});

interface CartItem extends Product {
  quantity: number;
}

const cart = ref<CartItem[]>([]);
const selectedCategory = ref('All');
const isProductDialogOpen = ref(false);
const selectedProduct = ref<Product | null>(null);
const isCartOpen = ref(false); // We'll simple simulate a dialog/modal with v-if or CSS
const searchQuery = ref('');
const sortBy = ref<'name' | 'price-low' | 'price-high' | 'rating'>('name');
const viewingOrder = ref<any | null>(null);
const activeTab = ref('menu');
const isOrderDetailsOpen = ref(false);

const orderCustomerName = ref('');
const showLoginPrompt = ref(false);

// Derived State
const isCashier = computed(() => user.value?.role?.toLowerCase() === 'cashier');

const customerOrders = computed(() => orders.value);

const categories = computed(() => ['All', ...new Set(products.value.map(p => p.category))]);

const filteredAndSortedProducts = computed(() => {
    let result = products.value.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (product.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false);
        const matchesCategory = selectedCategory.value === 'All' || product.category === selectedCategory.value;
        return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
        switch (sortBy.value) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });
});

const totalItems = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0));
const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0));

// Actions
const addToCart = (product: Product) => {
    const existingItem = cart.value.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + 1, product.stock);
    } else {
        cart.value.push({ ...product, quantity: 1 });
    }
    // In a real app we'd show a toast here
    console.log(`Added ${product.name} to cart`);
};

const updateQuantity = (productId: string, delta: number) => {
    const item = cart.value.find(item => item.id === productId);
    if (item) {
        const newQuantity = item.quantity + delta;
        item.quantity = Math.max(0, Math.min(newQuantity, item.stock));
        if (item.quantity === 0) {
            removeFromCart(productId);
        }
    }
};

const removeFromCart = (productId: string) => {
    cart.value = cart.value.filter(item => item.id !== productId);
};

const handleCheckout = async () => {
    if (!user.value) {
        showLoginPrompt.value = true;
        return;
    }

    if (isCashier.value && !orderCustomerName.value) {
        alert('Please enter a customer name for the Order at Shop.');
        return;
    }

    try {
        await addOrder({
            customerId: isCashier.value ? null : user.value.id,
            customerName: isCashier.value ? orderCustomerName.value : user.value.name,
            items: cart.value.map(item => ({
                productId: parseInt(item.id),
                quantity: item.quantity,
                price: item.price
            })),
            total: totalPrice.value
        });

        // Refresh orders
        if (isCashier.value) {
            await fetchOrders();
        } else {
            await fetchMyOrders();
        }

        alert('Order placed successfully!');
        cart.value = [];
        orderCustomerName.value = '';
        isCartOpen.value = false;
        activeTab.value = 'orders';
    } catch (err) {
        alert('Failed to place order. Please try again.');
    }
};

const openProductDetails = (product: Product) => {
    selectedProduct.value = product;
    isProductDialogOpen.value = true;
};

const addToCartFromDialog = () => {
    if (selectedProduct.value) {
        addToCart(selectedProduct.value);
        isProductDialogOpen.value = false;
    }
};

const viewOrderDetails = (order: Order) => {
    viewingOrder.value = order;
    isOrderDetailsOpen.value = true;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
        case 'Baking': 
        case 'Ready': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Pending':
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
};

</script>

<template>
<div class="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-accent-cream min-h-screen">
    <!-- Premium Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div class="min-w-0 flex-1">
            <h1 class="text-3xl sm:text-4xl font-bold text-bakery-900 tracking-tight">
                {{ t('shop.selection').split(' ')[0] }} <span class="text-bakery-600">{{ t('shop.selection').split(' ')[1] }}</span>
            </h1>
            <p class="text-bakery-500 mt-2 font-medium">{{ t('shop.slogan') }}</p>
        </div>

        <button
            @click="isCartOpen = true"
            class="relative group flex items-center gap-3 px-6 py-3 bg-white border border-bakery-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-bakery-200 transition-all duration-300"
        >
            <div class="w-10 h-10 rounded-xl bg-bakery-50 flex items-center justify-center group-hover:bg-bakery-100 transition-colors">
                <ShoppingCart class="w-5 h-5 text-bakery-600" />
            </div>
            <div class="text-left">
                <p class="text-xs font-bold text-bakery-400 uppercase tracking-widest leading-none mb-1">{{ t('shop.yourBasket') }}</p>
                <p class="text-sm font-bold text-bakery-900">${{ totalPrice.toFixed(2) }}</p>
            </div>
            <span v-if="totalItems > 0" class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-bakery-600 text-[10px] font-bold text-white shadow-lg animate-in zoom-in">
                {{ totalItems }}
            </span>
        </button>
    </div>

    <!-- Modern Tabs -->
    <div class="flex space-x-2 rounded-2xl bg-bakery-100/50 p-1.5 mb-8 max-w-full sm:max-w-md border border-bakery-100">
        <button
            @click="activeTab = 'menu'"
            :class="[
                activeTab === 'menu'
                ? 'bg-white text-bakery-900 shadow-md'
                : 'text-bakery-500 hover:text-bakery-700 hover:bg-bakery-100'
            ]"
            class="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200"
        >
            <Coffee class="w-4 h-4 mr-2" />
            {{ t('shop.menu') }}
        </button>
        <button
            @click="activeTab = 'orders'"
            :class="[
                activeTab === 'orders'
                ? 'bg-white text-bakery-900 shadow-md'
                : 'text-bakery-500 hover:text-bakery-700 hover:bg-bakery-100'
            ]"
            class="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200"
        >
            <History class="w-4 h-4 mr-2" />
            {{ isCashier ? t('shop.shopOrders') : t('shop.myOrders') }}
            <span class="ml-1 opacity-60">({{ customerOrders.length }})</span>
        </button>
    </div>


    <!-- Menu Content -->
    <div v-if="activeTab === 'menu'" class="space-y-6">
        <!-- Filters -->
        <div class="glass-card p-4 sm:p-6 rounded-3xl border border-bakery-100 mb-8 premium-shadow">
            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Search -->
                <div class="flex-1 relative group">
                    <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bakery-400 group-focus-within:text-bakery-600 transition-colors" />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search for croissants, cakes, or breads..."
                        class="w-full pl-12 pr-4 h-12 rounded-2xl border border-bakery-100 focus:outline-none focus:ring-2 focus:ring-bakery-300 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm transition-all"
                    >
                </div>

                <div class="flex flex-wrap items-center gap-4">
                    <!-- Category -->
                    <div class="flex items-center gap-3">
                        <Filter class="w-4 h-4 text-bakery-500" />
                        <select
                            v-model="selectedCategory"
                            class="h-12 px-4 rounded-2xl border border-bakery-100 focus:outline-none focus:ring-2 focus:ring-bakery-300 bg-white/50 text-sm font-semibold"
                        >
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat === 'All' ? t('shop.categories') : cat }}</option>
                        </select>
                    </div>

                    <!-- Sort -->
                    <div class="flex items-center gap-3">
                        <SlidersHorizontal class="w-4 h-4 text-bakery-500" />
                        <select
                            v-model="sortBy"
                            class="h-12 px-4 rounded-2xl border border-bakery-100 focus:outline-none focus:ring-2 focus:ring-bakery-300 bg-white/50 text-sm font-semibold"
                        >
                            <option value="name">Name</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>


        <!-- Products Grid -->
        <div v-if="filteredAndSortedProducts.length === 0" class="text-center py-12 glass-card rounded-3xl border border-bakery-100 premium-shadow">
            <div class="flex flex-col items-center gap-4">
                 <div class="w-16 h-16 rounded-full bg-bakery-50 flex items-center justify-center">
                    <Search class="w-8 h-8 text-bakery-600" />
                  </div>
                <h3 class="text-lg font-medium text-bakery-900">No products found</h3>
                <p class="text-bakery-600">Try adjusting your filters.</p>
                <button @click="searchQuery = ''; selectedCategory = 'All'" class="text-sm text-bakery-700 hover:underline">Clear all filters</button>
            </div>
        </div>
        <!-- Product Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <div
                v-for="product in filteredAndSortedProducts"
                :key="product.id"
                class="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-bakery-100 hover:border-bakery-300 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 animate-in fade-in zoom-in"
            >
                <div class="relative h-64 overflow-hidden">
                    <img :src="product.image" :alt="product.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                    <div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                        <p class="text-white text-sm font-medium line-clamp-2">{{ product.description }}</p>
                    </div>
                    <div class="absolute top-4 right-4 glass-card px-3 py-1.5 rounded-xl text-bakery-700 text-xs font-bold uppercase tracking-widest">
                        {{ product.category }}
                    </div>
                </div>

                <div class="p-6 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-bakery-900 group-hover:text-bakery-600 transition-colors">{{ product.name }}</h3>
                        <div v-if="product.rating" class="flex items-center gap-1.5 bg-bakery-50 text-bakery-700 px-2 py-1 rounded-lg">
                             <Star class="w-4 h-4 fill-bakery-600 text-bakery-600" />
                             <span class="text-sm font-bold">{{ product.rating }}</span>
                        </div>
                    </div>

                    <div class="mt-auto space-y-5">
                          <div class="flex justify-between items-center">
                             <div class="flex flex-col">
                                <span class="text-2xl font-black text-bakery-900">${{ product.price.toFixed(2) }}</span>
                                <span class="text-xs text-bakery-400 font-bold uppercase tracking-widest">{{ product.stock }} left</span>
                             </div>
                             <div class="flex gap-2">
                                <button @click="openProductDetails(product)" class="w-12 h-12 rounded-2xl border border-bakery-100 text-bakery-600 hover:bg-bakery-50 transition-all flex items-center justify-center shadow-sm">
                                    <Info class="w-5 h-5" />
                                </button>
                                <button
                                    @click="addToCart(product)"
                                    :disabled="product.stock === 0"
                                    class="h-12 px-6 rounded-2xl bg-bakery-600 text-white text-sm font-bold hover:bg-bakery-700 transition-all disabled:opacity-30 flex items-center shadow-lg shadow-bakery-100 active:scale-95"
                                >
                                    <Plus class="w-5 h-5 mr-2" /> {{ t('shop.addToCart').split(' ')[0] }}
                                </button>
                             </div>
                          </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- Orders Content -->
    <div v-if="activeTab === 'orders'" class="space-y-6">
        <div v-if="customerOrders.length === 0" class="text-center py-12 bg-white rounded-xl border border-green-200">
            <div class="flex flex-col items-center gap-4">
                 <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <History class="w-8 h-8 text-green-600" />
                  </div>
                <h3 class="text-lg font-medium text-green-900">{{ t('shop.noOrders') }}</h3>
                <p class="text-green-600">{{ t('shop.startBrowsing') }}</p>
                <button @click="activeTab = 'menu'" class="text-sm font-medium text-green-700 hover:text-green-900 hover:underline">
                    {{ t('shop.menu') }}
                </button>
            </div>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div v-for="order in customerOrders" :key="order.id" class="bg-white rounded-xl border border-green-200 p-4 hover:shadow-md transition-shadow">
                 <div class="text-center border-b border-green-100 pb-3 mb-3">
                    <p class="text-xs text-green-600 uppercase tracking-wider font-semibold">Matcha Bakery</p>
                    <p class="text-sm font-bold text-green-900 my-1">#{{ order.id }}</p>
                    <p class="text-xs text-cool-gray-500">{{ order.date }}</p>
                 </div>
                 <div class="flex justify-center mb-4">
                     <span :class="`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1`">
                        <!-- Icon would depend on status, simplifying for now -->
                        <Clock class="w-3 h-3" /> 
                        <span class="capitalize">{{ order.status }}</span>
                     </span>
                 </div>
                 <div class="border-t border-b border-green-100 py-3 mb-3 space-y-2">
                     <p class="text-xs font-medium text-green-600 mb-2">{{ t('shop.items') }}</p>
                    <div v-for="(item, idx) in order.items" :key="idx" class="flex justify-between text-xs">
                        <span class="text-gray-700">{{ item.productName }} <span class="text-green-600 ml-1">x{{ item.quantity }}</span></span>
                        <span class="text-gray-900 font-medium">${{ (item.price * item.quantity).toFixed(2) }}</span>
                    </div>
                 </div>
                 <div class="flex justify-between items-center mb-4">
                    <span class="text-sm font-medium text-gray-900">{{ t('shop.total') }}</span>
                    <span class="text-lg font-bold text-green-700">${{ order.total.toFixed(2) }}</span>
                 </div>
                 <button 
                    @click="viewOrderDetails(order)"
                    class="w-full h-8 rounded-md border border-green-200 text-green-700 text-xs hover:bg-green-50 flex items-center justify-center transition-colors"
                >
                    <Eye class="w-3 h-3 mr-1" /> {{ t('shop.viewDetails') }}
                 </button>
            </div>
        </div>
    </div>

    <!-- Global Cart Side Drawer -->
    <div 
        v-if="isCartOpen" 
        class="fixed inset-0 z-100 overflow-hidden"
    >
        <!-- Overlay -->
        <div 
            class="absolute inset-0 bg-bakery-950/40 backdrop-blur-sm transition-opacity duration-500 animate-in fade-in" 
            @click="isCartOpen = false"
        ></div>
        
        <div class="fixed inset-y-0 right-0 max-w-full flex">
            <div 
                class="relative w-screen max-w-md transform transition-transform duration-500 ease-in-out animate-in slide-in-from-right h-full"
            >
                <div class="h-full flex flex-col bg-white shadow-2xl border-l border-bakery-100">
                    <div class="p-8 border-b border-bakery-50 flex justify-between items-center bg-bakery-50/50">
                        <div>
                            <h3 class="font-black text-2xl text-bakery-900">{{ t('shop.yourBasket') }}</h3>
                            <p class="text-bakery-500 text-sm font-medium">{{ totalItems }} {{ t('shop.items').toLowerCase() }} selected</p>
                        </div>
                        <button 
                            @click="isCartOpen = false" 
                            class="w-12 h-12 rounded-2xl bg-white border border-bakery-100 text-bakery-400 hover:text-bakery-900 hover:rotate-90 transition-all flex items-center justify-center shadow-sm"
                        >
                            <XCircle class="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto p-8 scrollbar-hide">
                        <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div class="w-24 h-24 bg-bakery-50 rounded-full flex items-center justify-center">
                                <ShoppingCart class="w-10 h-10 text-bakery-200" />
                            </div>
                            <div>
                                <h4 class="text-xl font-bold text-bakery-900">{{ t('shop.emptyCart') }}</h4>
                                <p class="text-bakery-500 mt-2">Looks like you haven't added any treats yet.</p>
                            </div>
                            <button @click="isCartOpen = false" class="px-8 py-3 rounded-xl bg-bakery-600 text-white font-bold hover:bg-bakery-700 shadow-lg transition-all">
                                {{ t('shop.startBrowsing').split(' ')[0] }}
                            </button>
                        </div>
                        <div v-else class="space-y-6">
                            <div v-for="item in cart" :key="item.id" class="flex gap-4 group">
                                <div class="w-20 h-20 rounded-2xl overflow-hidden border border-bakery-100 shrink-0">
                                    <img :src="item.image" :alt="item.name" class="w-full h-full object-cover">
                                </div>
                                <div class="flex-1 flex flex-col justify-between py-1">
                                    <div class="flex justify-between items-start">
                                        <h4 class="font-bold text-bakery-900 leading-tight">{{ item.name }}</h4>
                                        <button @click="removeFromCart(item.id)" class="text-bakery-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <p class="text-bakery-600 font-bold">${{ (item.price * item.quantity).toFixed(2) }}</p>
                                        <div class="flex items-center gap-3 bg-bakery-50 p-1 rounded-xl">
                                             <button @click="updateQuantity(item.id, -1)" class="w-7 h-7 rounded-lg bg-white border border-bakery-100 flex items-center justify-center hover:bg-bakery-100 transition-colors"><Minus class="w-3 h-3" /></button>
                                             <span class="text-sm w-4 text-center font-bold text-bakery-900">{{ item.quantity }}</span>
                                             <button @click="updateQuantity(item.id, 1)" class="w-7 h-7 rounded-lg bg-white border border-bakery-100 flex items-center justify-center hover:bg-bakery-100 transition-colors"><Plus class="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="cart.length > 0" class="p-8 border-t border-bakery-100 bg-white space-y-6">
                         <!-- Cashier specific input -->
                         <div v-if="isCashier" class="space-y-3">
                              <label class="text-xs font-black text-bakery-400 uppercase tracking-widest">{{ t('shop.customerInfo') }}</label>
                              <input 
                                v-model="orderCustomerName" 
                                type="text" 
                                placeholder="Enter customer name..." 
                                class="w-full h-12 rounded-2xl border border-bakery-100 px-4 focus:outline-none focus:ring-2 focus:ring-bakery-300 text-sm bg-bakery-50/50 transition-all font-medium"
                              >
                         </div>
                         
                         <div class="space-y-3">
                             <div class="flex justify-between items-center text-bakery-500 font-medium">
                                  <span>Subtotal</span>
                                  <span>${{ totalPrice.toFixed(2) }}</span>
                             </div>
                             <div class="flex justify-between items-center text-2xl font-black text-bakery-900">
                                  <span>{{ t('shop.total') }}</span>
                                  <span>${{ totalPrice.toFixed(2) }}</span>
                             </div>
                         </div>

                         <button 
                            @click="handleCheckout"
                            class="w-full h-14 rounded-2xl bg-bakery-600 text-white font-bold text-lg hover:bg-bakery-700 shadow-2xl shadow-bakery-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {{ t('shop.checkout') }}
                            <ArrowRight class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    
    <!-- Product Details Modal -->
    <div v-if="isProductDialogOpen && selectedProduct" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
             <div class="p-6 overflow-y-auto">
                 <div class="flex justify-between items-start mb-6">
                     <div>
                        <h2 class="text-2xl font-bold text-green-900">{{ selectedProduct.name }}</h2>
                        <p class="text-gray-500">View detailed information including allergens</p>
                     </div>
                     <button @click="isProductDialogOpen = false" class="text-gray-400 hover:text-gray-600"><XCircle class="w-6 h-6" /></button>
                 </div>
                 
                 <div class="space-y-6">
                    <div class="relative h-64 sm:h-96 rounded-xl overflow-hidden bg-bakery-50/50 flex items-center justify-center">
                        <img :src="selectedProduct.image" :alt="selectedProduct.name" class="w-full h-full object-contain">
                         <span class="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">{{ selectedProduct.category }}</span>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <span class="text-2xl font-bold text-green-900">${{ selectedProduct.price.toFixed(2) }}</span>
                            <div v-if="selectedProduct.rating" class="flex items-center gap-1 text-sm font-medium bg-green-50 text-green-800 px-2 py-1 rounded">
                                <Star class="w-4 h-4 fill-green-600 text-green-600" /> {{ selectedProduct.rating }} / 5.0
                            </div>
                        </div>
                        <span class="text-sm text-gray-600 flex items-center gap-2">
                            <span :class="`w-2 h-2 rounded-full ${selectedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`"></span>
                            {{ selectedProduct.stock }} in stock
                        </span>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-2">Description</h3>
                        <p class="text-gray-600 leading-relaxed">{{ selectedProduct.description }}</p>
                    </div>
                    
                    <div v-if="selectedProduct.ingredients?.length">
                        <h3 class="font-semibold text-gray-900 mb-2">Ingredients</h3>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="(ing, i) in selectedProduct.ingredients" :key="i" class="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-sm border border-gray-200">
                                {{ ing }}
                            </span>
                        </div>
                    </div>
                    
                     <div v-if="selectedProduct.allergens?.length">
                        <h3 class="font-semibold text-gray-900 mb-2">Allergens</h3>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="(all, i) in selectedProduct.allergens" :key="i" class="px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-sm border border-red-200 font-medium">
                                {{ all }}
                            </span>
                        </div>
                    </div>
                 </div>
             </div>
             <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
                  <button @click="isProductDialogOpen = false" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors">Close</button>
                  <button 
                    @click="addToCartFromDialog"
                    :disabled="selectedProduct.stock === 0" 
                    class="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 shadow-md transition-colors disabled:opacity-50"
                >
                    Add to Cart
                  </button>
             </div>
        </div>
    </div>
    
    <!-- Order Details Modal -->
    <div v-if="isOrderDetailsOpen && viewingOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            <div class="p-6 border-b border-gray-100 bg-linear-to-r from-green-50 to-emerald-50">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold text-green-900">Order Details</h2>
                        <p class="text-sm text-green-600 mt-1">Order #{{ viewingOrder.id }}</p>
                    </div>
                    <button @click="isOrderDetailsOpen = false" class="text-gray-400 hover:text-gray-600">
                        <XCircle class="w-6 h-6" />
                    </button>
                </div>
            </div>
            
            <div class="p-6 overflow-y-auto flex-1 space-y-6">
                <!-- Order Status -->
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                        <span :class="`px-3 py-1 rounded-full text-sm font-medium border inline-flex items-center gap-2 ${getStatusColor(viewingOrder.status)}`">
                            <Clock class="w-4 h-4" />
                            <span class="capitalize">{{ viewingOrder.status }}</span>
                        </span>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Date</p>
                        <p class="text-sm font-medium text-gray-900">{{ viewingOrder.date }}</p>
                    </div>
                </div>

                <!-- Customer Information -->
                <div class="space-y-3">
                    <h3 class="font-semibold text-gray-900 flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span class="text-green-700 text-sm font-bold">{{ viewingOrder.customerName.charAt(0) }}</span>
                        </div>
                        Customer Information
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Name</p>
                            <p class="text-sm font-medium text-gray-900">{{ viewingOrder.customerName }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                            <p class="text-sm font-medium text-gray-900">{{ viewingOrder.customerEmail }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                            <p class="text-sm font-medium text-gray-900">{{ viewingOrder.phone }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Address</p>
                            <p class="text-sm font-medium text-gray-900">{{ viewingOrder.address }}</p>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="space-y-3">
                    <h3 class="font-semibold text-gray-900">Order Items</h3>
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <div class="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                                <div class="col-span-6">Product</div>
                                <div class="col-span-2 text-center">Qty</div>
                                <div class="col-span-2 text-right">Price</div>
                                <div class="col-span-2 text-right">Total</div>
                            </div>
                        </div>
                        <div class="divide-y divide-gray-200">
                            <div v-for="(item, idx) in viewingOrder.items" :key="idx" class="px-4 py-3 hover:bg-gray-50 transition-colors">
                                <div class="grid grid-cols-12 gap-2 items-center">
                                    <div class="col-span-6">
                                        <p class="text-sm font-medium text-gray-900">{{ item.productName }}</p>
                                    </div>
                                    <div class="col-span-2 text-center">
                                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                            {{ item.quantity }}
                                        </span>
                                    </div>
                                    <div class="col-span-2 text-right">
                                        <p class="text-sm text-gray-600">${{ item.price.toFixed(2) }}</p>
                                    </div>
                                    <div class="col-span-2 text-right">
                                        <p class="text-sm font-medium text-gray-900">${{ (item.price * item.quantity).toFixed(2) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="space-y-3 pt-4 border-t border-gray-200">
                    <h3 class="font-semibold text-gray-900">Order Summary</h3>
                    <div class="space-y-2 p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Subtotal</span>
                            <span class="font-medium text-gray-900">${{ viewingOrder.total.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Tax (0%)</span>
                            <span class="font-medium text-gray-900">$0.00</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Delivery Fee</span>
                            <span class="font-medium text-gray-900">$0.00</span>
                        </div>
                        <div class="pt-2 border-t border-green-300 flex justify-between items-center">
                            <span class="font-bold text-gray-900">Total</span>
                            <span class="text-2xl font-bold text-green-700">${{ viewingOrder.total.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                    @click="isOrderDetailsOpen = false" 
                    class="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 shadow-md transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    </div>

    <!-- Login Prompt Modal -->
    <div v-if="showLoginPrompt" class="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            <div class="p-8 text-center space-y-6">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Info class="w-10 h-10 text-green-600" />
                </div>
                <div class="space-y-2">
                    <h3 class="text-2xl font-bold text-green-900">{{ t('shop.loginRequired') }}</h3>
                    <p class="text-green-600">{{ t('shop.loginPrompt') }}</p>
                </div>
                <div class="flex flex-col gap-3">
                    <button 
                        @click="router.push('/login')"
                        class="w-full py-3 px-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
                    >
                        {{ t('shop.loginNow') }}
                    </button>
                    <button 
                        @click="showLoginPrompt = false"
                        class="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium rounded-xl transition-colors"
                    >
                        {{ t('shop.maybeLater') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>
