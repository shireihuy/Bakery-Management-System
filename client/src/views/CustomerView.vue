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
const { t } = useI18n();
const { products, fetchProducts } = useProducts();
const { addOrder, orders, fetchMyOrders, fetchOrders } = useOrders();
const { user } = useAuth();
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
            <h1 class="text-3xl sm:text-4xl font-bold text-bakery-900 dark:text-white tracking-tight">
                Our <span class="text-bakery-600 dark:text-bakery-400">Selection</span>
            </h1>
            <p class="text-bakery-500 dark:text-bakery-400 mt-2 font-medium">Handcrafted treats, baked with precision and passion.</p>
        </div>

        <button
            @click="isCartOpen = true"
            class="relative group flex items-center gap-3 px-6 py-3 bg-white dark:bg-bakery-900 border border-bakery-100 dark:border-bakery-800 rounded-2xl shadow-sm hover:shadow-xl hover:border-bakery-200 dark:hover:border-bakery-600 transition-all duration-300"
        >
            <div class="w-10 h-10 rounded-xl bg-bakery-50 dark:bg-bakery-800 flex items-center justify-center group-hover:bg-bakery-100 dark:group-hover:bg-bakery-700 transition-colors">
                <ShoppingCart class="w-5 h-5 text-bakery-600 dark:text-bakery-400" />
            </div>
            <div class="text-left">
                <p class="text-xs font-bold text-bakery-400 dark:text-bakery-500 uppercase tracking-widest leading-none mb-1">Your Basket</p>
                <p class="text-sm font-bold text-bakery-900 dark:text-white">${{ totalPrice.toFixed(2) }}</p>
            </div>
            <span v-if="totalItems > 0" class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-bakery-600 text-[10px] font-bold text-white shadow-lg animate-in zoom-in">
                {{ totalItems }}
            </span>
        </button>
    </div>

    <!-- Modern Tabs -->
    <div class="flex space-x-2 rounded-2xl bg-bakery-100/50 dark:bg-bakery-900/50 p-1.5 mb-8 max-w-full sm:max-w-md border border-bakery-100 dark:border-bakery-800">
        <button
            @click="activeTab = 'menu'"
            :class="[
                activeTab === 'menu'
                ? 'bg-white dark:bg-bakery-800 text-bakery-900 dark:text-white shadow-md'
                : 'text-bakery-500 dark:text-bakery-400 hover:text-bakery-700 dark:hover:text-bakery-200 hover:bg-bakery-100 dark:hover:bg-bakery-900'
            ]"
            class="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200"
        >
            <Coffee class="w-4 h-4 mr-2" />
            Menu
        </button>
        <button
            @click="activeTab = 'orders'"
            :class="[
                activeTab === 'orders'
                ? 'bg-white dark:bg-bakery-800 text-bakery-900 dark:text-white shadow-md'
                : 'text-bakery-500 dark:text-bakery-400 hover:text-bakery-700 dark:hover:text-bakery-200 hover:bg-bakery-100 dark:hover:bg-bakery-900'
            ]"
            class="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200"
        >
            <History class="w-4 h-4 mr-2" />
            {{ isCashier ? 'Shop Orders' : 'My Orders' }}
            <span class="ml-1 opacity-60">({{ customerOrders.length }})</span>
        </button>
    </div>


    <!-- Menu Content -->
    <div v-if="activeTab === 'menu'" class="space-y-6">
        <!-- Filters -->
        <div class="glass-card p-4 sm:p-6 rounded-3xl border border-bakery-100 dark:border-bakery-800 mb-8 premium-shadow">
            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Search -->
                <div class="flex-1 relative group">
                    <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bakery-400 dark:text-bakery-500 group-focus-within:text-bakery-600 dark:group-focus-within:text-bakery-400 transition-colors" />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search for croissants, cakes, or breads..."
                        class="w-full pl-12 pr-4 h-12 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 focus:border-transparent text-sm bg-white/50 dark:bg-bakery-950/50 backdrop-blur-sm transition-all text-bakery-900 dark:text-white"
                    >
                </div>

                <div class="flex flex-wrap items-center gap-4">
                    <!-- Category -->
                    <div class="flex items-center gap-3">
                        <Filter class="w-4 h-4 text-bakery-500 dark:text-bakery-400" />
                        <select
                            v-model="selectedCategory"
                            class="h-12 px-4 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-white/50 dark:bg-bakery-950/50 text-sm font-semibold text-bakery-900 dark:text-white"
                        >
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>

                    <!-- Sort -->
                    <div class="flex items-center gap-3">
                        <SlidersHorizontal class="w-4 h-4 text-bakery-500 dark:text-bakery-400" />
                        <select
                            v-model="sortBy"
                            class="h-12 px-4 rounded-2xl border border-bakery-100 dark:border-bakery-800 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 bg-white/50 dark:bg-bakery-950/50 text-sm font-semibold text-bakery-900 dark:text-white"
                        >
                            <option value="name">Name: A to Z</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>


        <!-- Products Grid -->
        <div v-if="filteredAndSortedProducts.length === 0" class="text-center py-12 glass-card rounded-3xl border border-bakery-100 dark:border-bakery-800 premium-shadow">
            <div class="flex flex-col items-center gap-4">
                 <div class="w-16 h-16 rounded-full bg-bakery-50 dark:bg-bakery-900 flex items-center justify-center">
                    <Search class="w-8 h-8 text-bakery-600 dark:text-bakery-400" />
                  </div>
                <h3 class="text-lg font-medium text-bakery-900 dark:text-white">No products found</h3>
                <p class="text-bakery-600 dark:text-bakery-400">Try adjusting your filters.</p>
                <button @click="searchQuery = ''; selectedCategory = 'All'" class="text-sm text-bakery-700 dark:text-bakery-300 hover:underline">Clear all filters</button>
            </div>
        </div>
        <!-- Product Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <div
                v-for="product in filteredAndSortedProducts"
                :key="product.id"
                class="group flex flex-col bg-white dark:bg-bakery-900 rounded-[2.5rem] overflow-hidden border border-bakery-100 dark:border-bakery-800 hover:border-bakery-300 dark:hover:border-bakery-600 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 animate-in fade-in zoom-in duration-700"
            >
                <div class="relative h-64 overflow-hidden">
                    <img :src="product.image" :alt="product.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                        <p class="text-white text-sm font-medium line-clamp-2">{{ product.description }}</p>
                    </div>
                    <div class="absolute top-4 right-4 glass-card px-3 py-1.5 rounded-xl text-bakery-700 dark:text-bakery-300 text-xs font-bold uppercase tracking-widest">
                        {{ product.category }}
                    </div>
                </div>

                <div class="p-6 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-bakery-900 dark:text-white group-hover:text-bakery-600 dark:group-hover:text-bakery-400 transition-colors">{{ product.name }}</h3>
                        <div v-if="product.rating" class="flex items-center gap-1.5 bg-bakery-50 dark:bg-bakery-800 text-bakery-700 dark:text-bakery-300 px-2 py-1 rounded-lg">
                             <Star class="w-4 h-4 fill-bakery-600 dark:fill-bakery-400 text-bakery-600 dark:text-bakery-400" />
                             <span class="text-sm font-bold">{{ product.rating }}</span>
                        </div>
                    </div>

                    <div class="mt-auto space-y-5">
                          <div class="flex justify-between items-center">
                             <div class="flex flex-col">
                                <span class="text-2xl font-black text-bakery-900 dark:text-white">${{ product.price.toFixed(2) }}</span>
                                <span class="text-xs text-bakery-400 dark:text-bakery-500 font-bold uppercase tracking-widest">{{ product.stock }} left</span>
                             </div>
                             <div class="flex gap-2">
                                <button @click="openProductDetails(product)" class="w-12 h-12 rounded-2xl border border-bakery-100 dark:border-bakery-800 text-bakery-600 dark:text-bakery-400 hover:bg-bakery-50 dark:hover:bg-bakery-800 transition-all flex items-center justify-center shadow-sm">
                                    <Info class="w-5 h-5" />
                                </button>
                                <button
                                    @click="addToCart(product)"
                                    :disabled="product.stock === 0"
                                    class="h-12 px-6 rounded-2xl bg-bakery-600 dark:bg-bakery-700 text-white text-sm font-bold hover:bg-bakery-700 dark:hover:bg-bakery-600 transition-all disabled:opacity-30 flex items-center shadow-lg shadow-bakery-100 dark:shadow-black/20 active:scale-95"
                                >
                                    <Plus class="w-5 h-5 mr-2" /> Add
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
        <div v-if="customerOrders.length === 0" class="text-center py-12 glass-card rounded-[2.5rem] border border-bakery-100 dark:border-bakery-800">
            <div class="flex flex-col items-center gap-4">
                 <div class="w-16 h-16 rounded-full bg-bakery-50 dark:bg-bakery-900 flex items-center justify-center">
                    <History class="w-8 h-8 text-bakery-600 dark:text-bakery-400" />
                  </div>
                <h3 class="text-lg font-medium text-bakery-900 dark:text-white">No orders yet</h3>
                <p class="text-bakery-600 dark:text-bakery-400">Start browsing our menu to place your first order!</p>
                <button @click="activeTab = 'menu'" class="text-sm font-medium text-bakery-700 dark:text-bakery-300 hover:text-bakery-900 dark:hover:text-white hover:underline">
                    Browse Menu
                </button>
            </div>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div v-for="order in customerOrders" :key="order.id" class="glass-card rounded-[2rem] border border-bakery-100 dark:border-bakery-800 p-6 hover:shadow-2xl transition-all group">
                 <div class="text-center border-b border-bakery-50 dark:border-bakery-800 pb-4 mb-4">
                    <p class="text-xs text-bakery-500 dark:text-bakery-400 uppercase tracking-widest font-black opacity-70">{{ t('bakeryName') }}</p>
                    <p class="text-xl font-black text-bakery-900 dark:text-white my-1">#{{ order.id }}</p>
                    <p class="text-[10px] text-bakery-400 dark:text-bakery-500 font-bold uppercase tracking-widest">{{ order.date }}</p>
                 </div>
                 <div class="flex justify-center mb-6">
                     <span :class="`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${order.status === 'Completed' ? 'bg-success-bg text-success-text border-success-text/20' : 'bg-bakery-50 dark:bg-bakery-800 text-bakery-600 dark:text-bakery-400 border-bakery-100 dark:border-bakery-700'}`">
                        <Clock class="w-3 h-3" /> 
                        <span class="capitalize">{{ order.status }}</span>
                     </span>
                 </div>
                 <div class="border-t border-b border-bakery-50 dark:border-bakery-800 py-4 mb-4 space-y-3">
                     <p class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Items</p>
                    <div v-for="(item, idx) in order.items" :key="idx" class="flex justify-between text-sm">
                        <span class="text-bakery-700 dark:text-bakery-300 font-medium">{{ item.productName }} <span class="text-bakery-400 ml-1 font-bold">x{{ item.quantity }}</span></span>
                        <span class="text-bakery-900 dark:text-white font-black">${{ (item.price * item.quantity).toFixed(2) }}</span>
                    </div>
                 </div>
                 <div class="flex justify-between items-center mb-6">
                    <span class="text-sm font-bold text-bakery-500 dark:text-bakery-400">Total Amount</span>
                    <span class="text-2xl font-black text-bakery-900 dark:text-white">${{ order.total.toFixed(2) }}</span>
                 </div>
                 <button 
                    @click="viewOrderDetails(order)"
                    class="w-full h-11 rounded-xl glass-card border border-bakery-100 dark:border-bakery-800 text-bakery-900 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-bakery-50 dark:hover:bg-bakery-800 flex items-center justify-center transition-all "
                >
                    <Eye class="w-4 h-4 mr-2" /> View Details
                 </button>
            </div>
        </div>
    </div>

    <!-- Global Cart Side Drawer -->
    <div 
        v-if="isCartOpen" 
        class="fixed inset-0 z-[100] overflow-hidden"
    >
        <!-- Overlay -->
        <div 
            class="absolute inset-0 bg-bakery-950/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-500 animate-in fade-in" 
            @click="isCartOpen = false"
        ></div>
        
        <div class="fixed inset-y-0 right-0 max-w-full flex">
            <div 
                class="relative w-screen max-w-md transform transition-transform duration-500 ease-in-out animate-in slide-in-from-right h-full"
            >
                <div class="h-full flex flex-col bg-white dark:bg-bakery-950 shadow-2xl border-l border-bakery-100 dark:border-bakery-800">
                    <div class="p-8 border-b border-bakery-50 dark:border-bakery-900 flex justify-between items-center bg-bakery-50/50 dark:bg-bakery-900/50">
                        <div>
                            <h3 class="font-black text-2xl text-bakery-900 dark:text-white">Your Basket</h3>
                            <p class="text-bakery-500 dark:text-bakery-400 text-sm font-medium">{{ totalItems }} items selected</p>
                        </div>
                        <button 
                            @click="isCartOpen = false" 
                            class="w-12 h-12 rounded-2xl bg-white dark:bg-bakery-900 border border-bakery-100 dark:border-bakery-800 text-bakery-400 hover:text-bakery-900 dark:hover:text-white hover:rotate-90 transition-all flex items-center justify-center shadow-sm"
                        >
                            <XCircle class="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto p-8 scrollbar-hide">
                        <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div class="w-24 h-24 bg-bakery-50 dark:bg-bakery-900 rounded-full flex items-center justify-center">
                                <ShoppingCart class="w-10 h-10 text-bakery-100 dark:text-bakery-800" />
                            </div>
                            <div>
                                <h4 class="text-xl font-bold text-bakery-900 dark:text-white">Your basket is empty</h4>
                                <p class="text-bakery-500 dark:text-bakery-400 mt-2">Looks like you haven't added any treats yet.</p>
                            </div>
                            <button @click="isCartOpen = false" class="px-8 py-3 rounded-xl bg-bakery-600 text-white font-bold hover:bg-bakery-700 shadow-lg transition-all">
                                Start Shopping
                            </button>
                        </div>
                        <div v-else class="space-y-6">
                            <div v-for="item in cart" :key="item.id" class="flex gap-4 group">
                                <div class="w-20 h-20 rounded-2xl overflow-hidden border border-bakery-100 dark:border-bakery-800 flex-shrink-0">
                                    <img :src="item.image" :alt="item.name" class="w-full h-full object-cover">
                                </div>
                                <div class="flex-1 flex flex-col justify-between py-1">
                                    <div class="flex justify-between items-start">
                                        <h4 class="font-bold text-bakery-900 dark:text-white leading-tight">{{ item.name }}</h4>
                                        <button @click="removeFromCart(item.id)" class="text-bakery-200 hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <p class="text-bakery-600 dark:text-bakery-400 font-bold">${{ (item.price * item.quantity).toFixed(2) }}</p>
                                        <div class="flex items-center gap-3 bg-bakery-50 dark:bg-bakery-900 p-1 rounded-xl">
                                             <button @click="updateQuantity(item.id, -1)" class="w-7 h-7 rounded-lg bg-white dark:bg-bakery-800 border border-bakery-100 dark:border-bakery-700 flex items-center justify-center hover:bg-bakery-100 dark:hover:bg-bakery-700 transition-colors"><Minus class="w-3 h-3 text-bakery-900 dark:text-white" /></button>
                                             <span class="text-sm w-4 text-center font-bold text-bakery-900 dark:text-white">{{ item.quantity }}</span>
                                             <button @click="updateQuantity(item.id, 1)" class="w-7 h-7 rounded-lg bg-white dark:bg-bakery-800 border border-bakery-100 dark:border-bakery-700 flex items-center justify-center hover:bg-bakery-100 dark:hover:bg-bakery-700 transition-colors"><Plus class="w-3 h-3 text-bakery-900 dark:text-white" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="cart.length > 0" class="p-8 border-t border-bakery-100 dark:border-bakery-800 bg-white dark:bg-bakery-950 space-y-6">
                         <!-- Cashier specific input -->
                         <div v-if="isCashier" class="space-y-3">
                              <label class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Customer Name</label>
                              <input 
                                v-model="orderCustomerName" 
                                type="text" 
                                placeholder="Enter customer name..." 
                                class="w-full h-12 rounded-2xl border border-bakery-100 dark:border-bakery-800 px-4 focus:outline-none focus:ring-2 focus:ring-bakery-300 dark:focus:ring-bakery-700 text-sm bg-bakery-50/50 dark:bg-bakery-900/50 transition-all font-medium text-bakery-900 dark:text-white"
                              >
                         </div>
                         
                         <div class="space-y-3">
                             <div class="flex justify-between items-center text-bakery-500 dark:text-bakery-400 font-medium">
                                  <span>Subtotal</span>
                                  <span>${{ totalPrice.toFixed(2) }}</span>
                             </div>
                             <div class="flex justify-between items-center text-2xl font-black text-bakery-900 dark:text-white">
                                  <span>Total</span>
                                  <span>${{ totalPrice.toFixed(2) }}</span>
                             </div>
                         </div>

                         <button 
                            @click="handleCheckout"
                            class="w-full h-14 rounded-2xl bg-bakery-600 text-white font-bold text-lg hover:bg-bakery-700 shadow-2xl shadow-bakery-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            Complete Order
                            <ArrowRight class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    
    <!-- Product Details Modal -->
    <div v-if="isProductDialogOpen && selectedProduct" class="fixed inset-0 z-[110] flex items-center justify-center bg-bakery-950/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div class="bg-white dark:bg-bakery-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-bakery-100 dark:border-bakery-800">
             <div class="p-8 overflow-y-auto scrollbar-hide">
                 <div class="flex justify-between items-start mb-8">
                     <div>
                        <h2 class="text-3xl font-black text-bakery-900 dark:text-white">{{ selectedProduct.name }}</h2>
                        <p class="text-bakery-500 dark:text-bakery-400 font-medium text-sm mt-1">Detailed artisan craftsmanship information</p>
                     </div>
                     <button @click="isProductDialogOpen = false" class="w-12 h-12 rounded-2xl bg-bakery-50 dark:bg-bakery-800 text-bakery-400 hover:text-bakery-900 dark:hover:text-white flex items-center justify-center transition-all">
                        <XCircle class="w-6 h-6" />
                     </button>
                 </div>
                 
                 <div class="space-y-8">
                    <div class="relative h-72 rounded-[2rem] overflow-hidden border border-bakery-100 dark:border-bakery-800">
                        <img :src="selectedProduct.image" :alt="selectedProduct.name" class="w-full h-full object-cover">
                         <span class="absolute top-6 right-6 bg-bakery-950/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{{ selectedProduct.category }}</span>
                    </div>
                    
                    <div class="flex items-center justify-between p-6 bg-bakery-50/50 dark:bg-bakery-950/50 rounded-3xl border border-bakery-50 dark:border-bakery-800">
                        <div class="flex items-center gap-6">
                            <span class="text-3xl font-black text-bakery-900 dark:text-white">${{ selectedProduct.price.toFixed(2) }}</span>
                            <div v-if="selectedProduct.rating" class="flex items-center gap-2 bg-white dark:bg-bakery-800 px-3 py-1.5 rounded-xl border border-bakery-100 dark:border-bakery-700">
                                <Star class="w-4 h-4 fill-bakery-600 dark:fill-bakery-400 text-bakery-600 dark:text-bakery-400" />
                                <span class="text-sm font-bold text-bakery-900 dark:text-white">{{ selectedProduct.rating }}</span>
                            </div>
                        </div>
                        <span class="text-[10px] font-black uppercase tracking-widest text-bakery-500 dark:text-bakery-400 flex items-center gap-2">
                            <div :class="`w-2 h-2 rounded-full ${selectedProduct.stock > 0 ? 'bg-success-text shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-danger-text'}`"></div>
                            {{ selectedProduct.stock }} in stock
                        </span>
                    </div>
                    
                    <div>
                        <h3 class="text-xs font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest mb-3">Product Description</h3>
                        <p class="text-bakery-700 dark:text-bakery-300 leading-relaxed font-medium">{{ selectedProduct.description }}</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div v-if="selectedProduct.ingredients?.length">
                            <h3 class="text-xs font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest mb-3">Ingredients</h3>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="(ing, i) in selectedProduct.ingredients" :key="i" class="px-3 py-1.5 rounded-xl bg-bakery-50 dark:bg-bakery-800 text-bakery-700 dark:text-bakery-300 text-xs font-bold border border-bakery-100 dark:border-bakery-700">
                                    {{ ing }}
                                </span>
                            </div>
                        </div>
                        
                         <div v-if="selectedProduct.allergens?.length">
                            <h3 class="text-xs font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest mb-3">Allergens</h3>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="(all, i) in selectedProduct.allergens" :key="i" class="px-3 py-1.5 rounded-xl bg-danger-bg text-danger-text text-xs font-black uppercase tracking-widest border border-danger-text/20">
                                    {{ all }}
                                </span>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
             <div class="p-8 bg-bakery-50/50 dark:bg-bakery-950/50 border-t border-bakery-100 dark:border-bakery-800 flex justify-end gap-4">
                  <button @click="isProductDialogOpen = false" class="px-8 py-3 rounded-2xl border border-bakery-100 dark:border-bakery-800 text-bakery-900 dark:text-white font-bold hover:bg-bakery-50 dark:hover:bg-bakery-800 transition-all">Close</button>
                  <button 
                    @click="addToCartFromDialog"
                    :disabled="selectedProduct.stock === 0" 
                    class="px-8 py-3 rounded-2xl bg-bakery-600 dark:bg-bakery-700 text-white font-bold hover:bg-bakery-700 dark:hover:bg-bakery-600 shadow-xl shadow-bakery-600/20 transition-all disabled:opacity-30"
                >
                    Add to Cart
                  </button>
             </div>
        </div>
    </div>
    
    <!-- Order Details Modal -->
    <div v-if="isOrderDetailsOpen && viewingOrder" class="fixed inset-0 z-[110] flex items-center justify-center bg-bakery-950/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div class="bg-white dark:bg-bakery-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-bakery-100 dark:border-bakery-800">
            <div class="p-8 border-b border-bakery-50 dark:border-bakery-800 bg-bakery-50/50 dark:bg-bakery-950/50">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-3xl font-black text-bakery-900 dark:text-white">Order History</h2>
                        <p class="text-sm text-bakery-500 dark:text-bakery-400 font-medium mt-1">Transaction Record #{{ viewingOrder.id }}</p>
                    </div>
                    <button @click="isOrderDetailsOpen = false" class="w-12 h-12 rounded-2xl bg-white dark:bg-bakery-800 border border-bakery-100 dark:border-bakery-700 text-bakery-400 hover:text-bakery-900 dark:hover:text-white flex items-center justify-center transition-all">
                        <XCircle class="w-6 h-6" />
                    </button>
                </div>
            </div>
            
            <div class="p-8 overflow-y-auto flex-1 space-y-8 scrollbar-hide">
                <!-- Order Status -->
                <div class="flex items-center justify-between p-6 bg-bakery-50/50 dark:bg-bakery-950/50 rounded-3xl border border-bakery-50 dark:border-bakery-800">
                    <div>
                        <p class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest mb-2">Status</p>
                        <span :class="`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-2 ${viewingOrder.status === 'Completed' ? 'bg-success-bg text-success-text border-success-text/20' : 'bg-white dark:bg-bakery-800 text-bakery-900 dark:text-white border-bakery-100 dark:border-bakery-700'}`">
                            <Clock class="w-3 h-3" />
                            <span class="capitalize">{{ viewingOrder.status }}</span>
                        </span>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest mb-2">Placed On</p>
                        <p class="text-sm font-bold text-bakery-900 dark:text-white">{{ viewingOrder.date }}</p>
                    </div>
                </div>

                <!-- Customer Information -->
                <div class="space-y-4">
                    <h3 class="text-xs font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Customer Details</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-bakery-50/50 dark:bg-bakery-950/50 rounded-3xl border border-bakery-50 dark:border-bakery-800">
                        <div>
                            <p class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest mb-1">Full Name</p>
                            <p class="text-sm font-bold text-bakery-900 dark:text-white">{{ viewingOrder.customerName }}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest mb-1">Contact Email</p>
                            <p class="text-sm font-bold text-bakery-900 dark:text-white">{{ viewingOrder.customerEmail || 'Not provided' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="space-y-4">
                    <h3 class="text-xs font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">Manifest</h3>
                    <div class="border border-bakery-50 dark:border-bakery-800 rounded-3xl overflow-hidden shadow-sm">
                        <div class="bg-bakery-50/50 dark:bg-bakery-950/50 px-6 py-4 border-b border-bakery-50 dark:border-bakery-800">
                            <div class="grid grid-cols-12 gap-2 text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest">
                                <div class="col-span-6">Creation</div>
                                <div class="col-span-2 text-center">Qty</div>
                                <div class="col-span-4 text-right">Total</div>
                            </div>
                        </div>
                        <div class="divide-y divide-bakery-50 dark:divide-bakery-800">
                            <div v-for="(item, idx) in viewingOrder.items" :key="idx" class="px-6 py-4 hover:bg-bakery-50/30 dark:hover:bg-bakery-800/30 transition-colors">
                                <div class="grid grid-cols-12 gap-2 items-center">
                                    <div class="col-span-6">
                                        <p class="text-sm font-bold text-bakery-900 dark:text-white">{{ item.productName }}</p>
                                        <p class="text-[10px] text-bakery-400 dark:text-bakery-500 font-bold">${{ item.price.toFixed(2) }} unit</p>
                                    </div>
                                    <div class="col-span-2 text-center">
                                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-bakery-50 dark:bg-bakery-800 text-bakery-900 dark:text-white text-xs font-black">
                                            {{ item.quantity }}
                                        </span>
                                    </div>
                                    <div class="col-span-4 text-right">
                                        <p class="text-sm font-black text-bakery-900 dark:text-white">${{ (item.price * item.quantity).toFixed(2) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="space-y-4 p-8 bg-bakery-900 dark:bg-bakery-100 rounded-[2.5rem] shadow-xl text-white dark:text-bakery-900">
                    <div class="flex justify-between items-center opacity-70">
                        <span class="text-xs font-black uppercase tracking-widest">Bakery Total</span>
                        <span class="font-bold">${{ viewingOrder.total.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-3xl font-black">
                        <span>Total Due</span>
                        <span>${{ viewingOrder.total.toFixed(2) }}</span>
                    </div>
                </div>
            </div>
            
            <div class="p-8 bg-bakery-50/30 dark:bg-bakery-950/30 border-t border-bakery-100 dark:border-bakery-800 flex justify-end">
                <button 
                    @click="isOrderDetailsOpen = false" 
                    class="px-10 py-3 rounded-2xl bg-bakery-900 dark:bg-white text-white dark:text-bakery-900 font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                    Close
                </button>
            </div>
        </div>
    </div>

    <!-- Login Prompt Modal -->
    <div v-if="showLoginPrompt" class="fixed inset-0 z-[120] flex items-center justify-center bg-bakery-950/60 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-bakery-900 rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300 border border-bakery-100 dark:border-bakery-800">
            <div class="p-10 text-center space-y-8">
                <div class="w-24 h-24 bg-bakery-50 dark:bg-bakery-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Info class="w-10 h-10 text-bakery-600 dark:text-bakery-400" />
                </div>
                <div class="space-y-3">
                    <h3 class="text-2xl font-black text-bakery-900 dark:text-white">Sign In Required</h3>
                    <p class="text-bakery-500 dark:text-bakery-400 font-medium">Please sign in to complete your purchase and track your order.</p>
                </div>
                <div class="flex flex-col gap-4">
                    <button 
                        @click="router.push('/login')"
                        class="w-full py-4 bg-bakery-900 dark:bg-white text-white dark:text-bakery-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95"
                    >
                        Sign In Now
                    </button>
                    <button 
                        @click="showLoginPrompt = false"
                        class="w-full py-4 text-bakery-400 dark:text-bakery-500 font-bold hover:text-bakery-900 dark:hover:text-white transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>
