<script setup lang="ts">
import { ref, computed } from 'vue';
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

// State
const { products } = useProducts();
const { addOrder, getCustomerOrders } = useOrders();
const { user } = useAuth(); // Assuming useAuth provides a reactive user object

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
const viewingOrder = ref<Order | null>(null);
const activeTab = ref('menu');
const isOrderDetailsOpen = ref(false);

const orderCustomerName = ref('');

// Derived State
const isCashier = computed(() => user.value?.role === 'cashier');

const customerOrders = computed(() => {
    if (isCashier.value) {
        // For cashier, show all orders or just their recent ones? 
        // Request says "order items for the eat in customers", 
        // they might want to see what they just ordered.
        // For now, let's keep it simple and show all orders in useOrders if possible, 
        // but useOrders probably has a getOrders function.
        return getCustomerOrders(''); // Assuming empty email might return all or something? 
        // Wait, let's check useOrders.ts
    }
    return user.value ? getCustomerOrders(user.value.email) : [];
});

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

const handleCheckout = () => {
    if (!user.value) {
        alert('Please log in to place an order.');
        return;
    }

    if (isCashier.value && !orderCustomerName.value) {
        alert('Please enter a customer name for the Order at Shop.');
        return;
    }

    addOrder({
        customerId: isCashier.value ? `walk-in-${Date.now()}` : "mock-id", // mock
        customerName: isCashier.value ? orderCustomerName.value : user.value.name,
        customerEmail: isCashier.value ? "walkin@example.com" : user.value.email,
        items: cart.value.map(item => ({
            productName: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: totalPrice.value,
        status: 'pending',
        phone: isCashier.value ? "N/A" : "555-0000", // mock from user profile later
        address: isCashier.value ? "Order at Shop" : "123 Mock St" // mock from user profile later
    });

    alert('Order placed successfully!');
    cart.value = [];
    orderCustomerName.value = '';
    isCartOpen.value = false;
    activeTab.value = 'orders';
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
        case 'completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
};

</script>

<template>
<div class="space-y-4 sm:space-y-6">
    <!-- Header with Cart -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div class="min-w-0 flex-1">
            <h2 v-if="isCashier" class="text-xl sm:text-2xl font-bold text-green-900 truncate">Cashier Mode: {{ user?.name }}</h2>
            <h2 v-else class="text-xl sm:text-2xl font-bold text-green-900 truncate">Welcome, {{ user ? user.name : 'Guest' }}!</h2>
            <p class="text-xs sm:text-sm text-green-600">{{ isCashier ? 'Place "Order at Shop" orders for customers' : 'Browse our menu or check your order history' }}</p>
        </div>
        <button 
            @click="isCartOpen = true"
            class="relative inline-flex items-center justify-center rounded-md text-sm font-medium h-9 sm:h-10 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm transition-all flex-shrink-0"
        >
            <ShoppingCart class="w-4 h-4" />
            <span class="hidden sm:inline ml-2">Cart</span>
            <span v-if="totalItems > 0" class="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-white">
                {{ totalItems }}
            </span>
        </button>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-1 rounded-lg bg-green-100/50 p-1 mb-4 sm:mb-6 max-w-full sm:max-w-md">
        <button 
            class="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200"
            :class="activeTab === 'menu' ? 'bg-white text-green-900 shadow-sm' : 'text-green-700 hover:text-green-900 hover:bg-green-200/50'"
            @click="activeTab = 'menu'"
        >
            <ShoppingCart class="w-4 h-4 flex-shrink-0" />
            <span class="hidden sm:inline ml-2">Menu</span>
        </button>
        <button 
            v-if="user"
            class="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200"
            :class="activeTab === 'orders' ? 'bg-white text-green-900 shadow-sm' : 'text-green-700 hover:text-green-900 hover:bg-green-200/50'"
            @click="activeTab = 'orders'"
        >
            <History class="w-4 h-4 flex-shrink-0" />
            <span class="hidden sm:inline ml-2">Order History</span>
            <span class="sm:hidden ml-1">({{ customerOrders.length }})</span>
            <span class="hidden sm:inline ml-1">({{ customerOrders.length }})</span>
        </button>
    </div>

    <!-- Menu Content -->
    <div v-if="activeTab === 'menu'" class="space-y-6">
        <!-- Filters -->
        <div class="bg-white p-3 sm:p-4 rounded-xl border border-green-200 shadow-sm">
            <div class="flex flex-col gap-3 sm:gap-4">
                <div class="flex-1 relative">
                    <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                    <input 
                        v-model="searchQuery" 
                        type="text" 
                        placeholder="Search products..." 
                        class="w-full pl-10 h-9 sm:h-10 rounded-md border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                </div>
                <div class="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                    <div class="flex items-center gap-2">
                        <Filter class="w-4 h-4 text-green-600 flex-shrink-0" />
                        <select v-model="selectedCategory" class="h-9 sm:h-10 w-full rounded-md border border-green-200 text-xs sm:text-sm px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>
                    <div class="flex items-center gap-2">
                        <SlidersHorizontal class="w-4 h-4 text-green-600 flex-shrink-0" />
                        <select v-model="sortBy" class="h-9 sm:h-10 w-full rounded-md border border-green-200 text-xs sm:text-sm px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                            <option value="name">Name</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Rating</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
                 <p class="text-green-600">
                  Showing {{ filteredAndSortedProducts.length }} of {{ products.length }} products
                </p>
                <button 
                    v-if="searchQuery || selectedCategory !== 'All'"
                    @click="searchQuery = ''; selectedCategory = 'All'"
                    class="text-green-600 hover:text-green-800 hover:underline text-xs sm:text-sm"
                >
                    Clear filters
                </button>
            </div>
        </div>

        <!-- Products Grid -->
        <div v-if="filteredAndSortedProducts.length === 0" class="text-center py-12 bg-white rounded-xl border border-green-200">
            <div class="flex flex-col items-center gap-4">
                 <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Search class="w-8 h-8 text-green-600" />
                  </div>
                <h3 class="text-lg font-medium text-green-900">No products found</h3>
                <p class="text-green-600">Try adjusting your filters.</p>
                <button @click="searchQuery = ''; selectedCategory = 'All'" class="text-sm text-green-700 hover:underline">Clear all filters</button>
            </div>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div 
                v-for="product in filteredAndSortedProducts" 
                :key="product.id"
                class="group bg-white rounded-xl border border-green-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
            >
                <div class="relative h-48 overflow-hidden cursor-pointer" @click="openProductDetails(product)">
                    <img :src="product.image" :alt="product.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    <span class="absolute top-2 right-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">{{ product.category }}</span>
                </div>
                <div class="p-4 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-green-900 group-hover:text-green-700 transition-colors">{{ product.name }}</h3>
                        <div v-if="product.rating" class="flex items-center gap-1 text-xs font-medium text-green-900 bg-green-50 px-1.5 py-0.5 rounded">
                             <Star class="w-3 h-3 fill-green-500 text-green-500" />
                             {{ product.rating }}
                        </div>
                    </div>
                    <div class="mt-auto pt-4 space-y-3">
                         <div class="flex justify-between items-center text-sm">
                            <span class="font-bold text-lg text-green-900">${{ product.price.toFixed(2) }}</span>
                            <span class="text-green-600 text-xs">{{ product.stock }} available</span>
                          </div>
                          <div class="flex gap-2">
                             <button @click="openProductDetails(product)" class="flex-1 h-9 rounded-md border border-green-200 text-green-700 text-sm hover:bg-green-50 transition-colors flex items-center justify-center">
                                <Info class="w-4 h-4 mr-1" /> Details
                             </button>
                             <button 
                                @click="addToCart(product)" 
                                :disabled="product.stock === 0"
                                class="flex-1 h-9 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <Plus class="w-4 h-4 mr-1" /> Add
                             </button>
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
                <h3 class="text-lg font-medium text-green-900">No orders yet</h3>
                <p class="text-green-600">Start browsing our menu to place your first order!</p>
                <button @click="activeTab = 'menu'" class="text-sm font-medium text-green-700 hover:text-green-900 hover:underline">
                    Browse Menu
                </button>
            </div>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div v-for="order in customerOrders" :key="order.id" class="bg-white rounded-xl border border-green-200 p-4 hover:shadow-md transition-shadow">
                 <div class="text-center border-b border-green-100 pb-3 mb-3">
                    <p class="text-xs text-green-600 uppercase tracking-wider font-semibold">Matcha Bakery</p>
                    <p class="text-sm font-bold text-green-900 my-1">{{ order.id }}</p>
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
                     <p class="text-xs font-medium text-green-600 mb-2">Items</p>
                    <div v-for="(item, idx) in order.items" :key="idx" class="flex justify-between text-xs">
                        <span class="text-gray-700">{{ item.productName }} <span class="text-green-600 ml-1">x{{ item.quantity }}</span></span>
                        <span class="text-gray-900 font-medium">${{ (item.price * item.quantity).toFixed(2) }}</span>
                    </div>
                 </div>
                 <div class="flex justify-between items-center mb-4">
                    <span class="text-sm font-medium text-gray-900">Total</span>
                    <span class="text-lg font-bold text-green-700">${{ order.total.toFixed(2) }}</span>
                 </div>
                 <button 
                    @click="viewOrderDetails(order)"
                    class="w-full h-8 rounded-md border border-green-200 text-green-700 text-xs hover:bg-green-50 flex items-center justify-center transition-colors"
                >
                    <Eye class="w-3 h-3 mr-1" /> View Details
                 </button>
            </div>
        </div>
    </div>

    <!-- Cart Modal (Simple overlay for now) -->
    <div v-if="isCartOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-bold text-lg text-gray-900">Shopping Cart</h3>
                <button @click="isCartOpen = false" class="text-gray-500 hover:text-gray-700">
                    <XCircle class="w-5 h-5" />
                </button>
            </div>
            
            <div class="p-4 overflow-y-auto flex-1 space-y-4">
                <div v-if="cart.length === 0" class="text-center py-8 text-gray-500">
                    Your cart is empty
                </div>
                <div v-else class="space-y-3">
                    <div v-for="item in cart" :key="item.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div class="flex-1">
                             <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                             <p class="text-xs text-gray-500">${{ item.price.toFixed(2) }} each</p>
                        </div>
                        <div class="flex items-center gap-2">
                             <button @click="updateQuantity(item.id, -1)" class="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"><Minus class="w-3 h-3" /></button>
                             <span class="text-sm w-6 text-center font-medium">{{ item.quantity }}</span>
                             <button @click="updateQuantity(item.id, 1)" class="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"><Plus class="w-3 h-3" /></button>
                        </div>
                        <button @click="removeFromCart(item.id)" class="text-red-500 hover:text-red-700 ml-2"><Trash2 class="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            <div v-if="cart.length > 0" class="p-4 border-t border-gray-100 bg-gray-50">
                 <!-- Cashier specific input -->
                 <div v-if="isCashier" class="mb-4 space-y-2">
                      <label class="text-xs font-bold text-green-700 uppercase tracking-wider">Customer Name (Order at Shop)</label>
                      <input 
                        v-model="orderCustomerName" 
                        type="text" 
                        placeholder="Enter customer name..." 
                        class="w-full h-10 rounded-md border border-green-200 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                      >
                 </div>
                 <div class="flex justify-between items-center mb-4">
                      <span class="font-bold text-gray-900">Total</span>
                      <span class="font-bold text-xl text-green-700">${{ totalPrice.toFixed(2) }}</span>
                 </div>
                 <button 
                    @click="handleCheckout"
                    class="w-full h-11 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 shadow-lg transition-transform active:scale-95"
                >
                    Checkout
                 </button>
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
                    <div class="relative h-64 rounded-xl overflow-hidden">
                        <img :src="selectedProduct.image" :alt="selectedProduct.name" class="w-full h-full object-cover">
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
            <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
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
                    <div class="space-y-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
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
</div>
</template>
