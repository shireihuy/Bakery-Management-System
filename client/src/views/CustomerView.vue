<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
  Eye,
  CreditCard,
  Coffee,
  ArrowRight,
  Truck,
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next';
import { useProducts, type Product } from '../composables/useProducts';
import DeliveryTracker from '../components/DeliveryTracker.vue';
import { useOrders, type Order } from '../composables/useOrders';
import { useAuth } from '../composables/useAuth';
import { useI18n } from '../composables/useI18n';
import { useCurrency } from '../composables/useCurrency';
import { useCart } from '../composables/useCart';
import { useGHN } from '../composables/useGHN';
import FlashSaleSection from '../components/FlashSaleSection.vue';
import { useUsers } from '../composables/useUsers';


// State
const { products, fetchProducts, submitRating } = useProducts();
const { addOrder, orders, fetchMyOrders, fetchOrders, updateOrderStatus } = useOrders();
const { user } = useAuth();
const { t } = useI18n();
const { formatPrice } = useCurrency();
const { cart, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();
const { provinces, districts, wards, fetchProvinces, fetchDistricts, fetchWards, fetchFee } = useGHN();
const { users } = useUsers();
const router = useRouter();


// Cart state is from composable now
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
const staffSearchQuery = ref('');
const isSearchingUser = ref(false);
const selectedUserId = ref<string | null>(null);
const showLoginPrompt = ref(false);

const userRating = ref(0);
const hoverRating = ref(0);
const isSubmittingRating = ref(false);
const activeFlashSales = ref<any[]>([]);
const isLoadingFlashSales = ref(false);


const couponCodeInput = ref('');
const appliedCoupon = ref<any>(null);
const couponError = ref('');
const isApplyingCoupon = ref(false);
const selectedDeliveryType = ref<'Pick-up' | 'Delivery'>('Pick-up');
const DELIVERY_FEE = ref(0.50);
const selectedProvince = ref<number | null>(null);
const selectedDistrict = ref<number | null>(null);
const selectedWard = ref<string | null>(null);
const streetAddress = ref('');
const isAddressExpanded = ref(true);

// Derived State
const isStaff = computed(() => {
    const role = user.value?.role?.toLowerCase();
    return ['admin', 'manager', 'cashier'].includes(role || '');
});

const filteredSystemUsers = computed(() => {
    if (!staffSearchQuery.value) return [];
    const q = staffSearchQuery.value.toLowerCase();
    return users.value.filter(u => 
        (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
        u.role === 'Customer'
    ).slice(0, 5);
});

const selectStaffCustomer = (systemUser: any) => {
    orderCustomerName.value = systemUser.name;
    selectedUserId.value = systemUser.id;
    staffSearchQuery.value = systemUser.name;
    isSearchingUser.value = false;
};

const handleStaffNameInput = () => {
    orderCustomerName.value = staffSearchQuery.value;
    selectedUserId.value = null; // Clear ID if typing manually
    isSearchingUser.value = true;
};

const handleStaffBlur = () => {
    setTimeout(() => {
        isSearchingUser.value = false;
    }, 200);
};

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
const subTotalPrice = computed(() => cart.value.reduce((sum, item) => {
    if (item.flashSale) {
        const availableSaleStock = Math.max(0, item.flashSale.stock - item.flashSale.sold);
        const saleQty = Math.min(item.quantity, availableSaleStock);
        const normalQty = Math.max(0, item.quantity - saleQty);
        return sum + (saleQty * item.flashSale.salePrice) + (normalQty * item.price);
    }
    return sum + (item.price * item.quantity);
}, 0));


const discountAmount = computed(() => {
    if (!appliedCoupon.value) return 0;
    let discount = 0;
    const totalToApply = subTotalPrice.value + (selectedDeliveryType.value === 'Delivery' ? DELIVERY_FEE.value : 0);
    if (appliedCoupon.value.discount_type === 'percentage') {
        discount = totalToApply * (Number(appliedCoupon.value.discount_value) / 100);
    } else {
        discount = Number(appliedCoupon.value.discount_value);
    }
    return Math.min(discount, totalToApply); // discount can't be more than total
});

const totalPrice = computed(() => {
    const totalBeforeDiscount = subTotalPrice.value + (selectedDeliveryType.value === 'Delivery' ? DELIVERY_FEE.value : 0);
    return Math.max(0, totalBeforeDiscount - discountAmount.value);
});

const mapUrl = computed(() => {
    let addressParts = [];
    if (selectedWard.value) {
        const ward = wards.value.find(w => w.WardCode === selectedWard.value);
        if (ward) addressParts.push(ward.WardName);
    }
    if (selectedDistrict.value) {
        const district = districts.value.find(d => d.DistrictID === selectedDistrict.value);
        if (district) addressParts.push(district.DistrictName);
    }
    if (selectedProvince.value) {
        const province = provinces.value.find(p => p.ProvinceID === selectedProvince.value);
        if (province) addressParts.push(province.ProvinceName);
    }
    if (streetAddress.value) {
        addressParts.unshift(streetAddress.value);
    }
    
    // If no specific address parts, use user's address or a generic location
    const address = addressParts.length > 0 ? addressParts.join(', ') : (user.value?.address || 'Vietnam');
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
});

// Actions
const handleCheckout = async () => {
    if (!user.value) {
        showLoginPrompt.value = true;
        return;
    }

    if (isStaff.value && !orderCustomerName.value) {
        alert('Please enter a customer name for the Order.');
        return;
    }

    try {
        const addressPartsList = [];
        if (streetAddress.value) addressPartsList.push(streetAddress.value);
        if (selectedWard.value) addressPartsList.push(wards.value.find(w => w.WardCode === selectedWard.value)?.WardName);
        if (selectedDistrict.value) addressPartsList.push(districts.value.find(d => d.DistrictID === selectedDistrict.value)?.DistrictName);
        if (selectedProvince.value) addressPartsList.push(provinces.value.find(p => p.ProvinceID === selectedProvince.value)?.ProvinceName);
        const fullAddress = addressPartsList.filter(Boolean).join(', ') || user.value.address;

        const result = await addOrder({
            customerId: isStaff.value ? (selectedUserId.value || 'GUEST') : user.value.id,
            customerName: isStaff.value ? orderCustomerName.value : user.value.name,
            customerEmail: isStaff.value ? (selectedUserId.value ? users.value.find(u => u.id === selectedUserId.value)?.email : 'walkin@example.com') : user.value.email,
            customerPhone: isStaff.value ? (selectedUserId.value ? users.value.find(u => u.id === selectedUserId.value)?.phone : null) : user.value.phone,
            customerAddress: isStaff.value ? (selectedUserId.value ? users.value.find(u => u.id === selectedUserId.value)?.address : null) : fullAddress,
            deliveryType: selectedDeliveryType.value,
            district_id: selectedDistrict.value,
            ward_code: selectedWard.value,
            items: cart.value.map(item => ({
                productId: parseInt(item.id),
                quantity: item.quantity,
                subtotal: (item.quantity * item.price).toFixed(2),
                price: item.price
            })),
            coupon_code: appliedCoupon.value?.code || null,
            total_price: totalPrice.value
        });

        // Clear cart before redirecting
        await clearCart();
        orderCustomerName.value = '';
        staffSearchQuery.value = '';
        selectedUserId.value = null;
        appliedCoupon.value = null;
        couponCodeInput.value = '';
        isCartOpen.value = false;

        // Redirect to payment view
        router.push(`/payment/${result.orderId}`);
    } catch (err) {
        alert('Failed to place order. Please try again.');
    }
};

const openProductDetails = (product: Product) => {
    selectedProduct.value = product;
    userRating.value = 0;
    hoverRating.value = 0;
    isProductDialogOpen.value = true;
};

const handleRateProduct = async (rating: number) => {
    if (!selectedProduct.value || !user.value) {
        if (!user.value) showLoginPrompt.value = true;
        return;
    }
    
    isSubmittingRating.value = true;
    try {
        await submitRating(selectedProduct.value.id, rating);
        userRating.value = rating;
        // fetchProducts will be called by useProducts or socket
    } catch (err) {
        alert('Failed to submit rating');
    } finally {
        isSubmittingRating.value = false;
    }
};

const applyCoupon = async () => {
    if (!couponCodeInput.value.trim()) return;
    
    isApplyingCoupon.value = true;
    couponError.value = '';
    
    try {
        const response = await fetch('http://localhost:3000/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: couponCodeInput.value.trim(), cartSubtotal: subTotalPrice.value })
        });
        
        const data = await response.json();
        if (response.ok && data.valid) {
            appliedCoupon.value = {
                code: couponCodeInput.value.trim(),
                ...data
            };
        } else {
            couponError.value = data.message || 'Invalid coupon code';
            appliedCoupon.value = null;
        }
    } catch (err) {
        couponError.value = 'Error validating coupon';
        appliedCoupon.value = null;
    } finally {
        isApplyingCoupon.value = false;
    }
};

const removeCoupon = () => {
    appliedCoupon.value = null;
    couponCodeInput.value = '';
    couponError.value = '';
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

// Animation state
const cartButtonRef = ref<HTMLElement | null>(null);
const isCartBouncing = ref(false);
const flyingItems = ref<{ id: number, x: number, y: number, targetX: number, targetY: number, image: string, flying: boolean }[]>([]);
let flyIdCounter = 0;

const handleAddToCart = (product: Product, event: MouseEvent | null) => {
    // Check if flash sale is actually valid (has stock)
    const activeProduct = { ...product };
    if (activeProduct.flashSale && activeProduct.flashSale.sold >= activeProduct.flashSale.stock) {
        activeProduct.flashSale = null;
    }
    
    addToCart(activeProduct);

    
    // Bounce effect
    isCartBouncing.value = true;
    setTimeout(() => {
        isCartBouncing.value = false;
    }, 600);

    // Fly effect
    if (cartButtonRef.value && event) {
        const cartRect = cartButtonRef.value.getBoundingClientRect();
        const id = flyIdCounter++;
        
        const newItem = {
            id,
            x: event.clientX - 20,
            y: event.clientY - 20,
            targetX: cartRect.left + 10,
            targetY: cartRect.top + 10,
            image: product.image,
            flying: false
        };
        
        flyingItems.value.push(newItem);
        
        setTimeout(() => {
            const item = flyingItems.value.find(i => i.id === id);
            if (item) item.flying = true;
        }, 50);

        setTimeout(() => {
            flyingItems.value = flyingItems.value.filter(i => i.id !== id);
        }, 1000);
    }
};

const handleFlashSaleAddToCart = (item: any, event: MouseEvent | null) => {
    const product: any = {
        id: item.product_id.toString(),
        name: item.name,
        price: parseFloat(item.original_price),
        image: item.image,
        stock: item.flash_sale_stock,
        flashSale: {
            salePrice: parseFloat(item.sale_price),
            stock: item.flash_sale_stock,
            sold: item.sold_quantity,
            endTime: '' 
        }
    };
    handleAddToCart(product, event);
};


const addToCartFromDialogExtended = (event: MouseEvent) => {
    if (selectedProduct.value) {
        handleAddToCart(selectedProduct.value, event);
        isProductDialogOpen.value = false;
    }
};

const isCancelModalOpen = ref(false);

const fetchActiveFlashSales = async () => {

    isLoadingFlashSales.value = true;
    try {
        const url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${url}/flash-sales/active`);
        if (response.ok) {
            const data = await response.json();
            // Map image paths to full URLs if they are relative paths from the server
            activeFlashSales.value = data.map((sale: any) => ({
                ...sale,
                items: sale.items.map((item: any) => ({
                    ...item,
                    image: item.image?.startsWith('/') ? `${url.replace('/api', '')}${item.image}` : item.image
                }))
            }));
        }

    } catch (err) {
        console.error('Failed to fetch flash sales:', err);
    } finally {
        isLoadingFlashSales.value = false;
    }
};

onMounted(async () => {
    await fetchProducts();
    await fetchActiveFlashSales();
    await fetchCart();

    if (user.value) {
        if (isStaff.value) {
            await fetchOrders();
        } else {
            await fetchMyOrders();
        }
        
        if (user.value.address) {
            streetAddress.value = user.value.address;
        }
        
        // Auto-populate delivery location if saved in profile
        if (user.value.province_id) {
            selectedProvince.value = user.value.province_id;
            await fetchDistricts(user.value.province_id);
            if (user.value.district_id) {
                selectedDistrict.value = user.value.district_id;
                await fetchWards(user.value.district_id);
                if (user.value.ward_code) {
                    selectedWard.value = user.value.ward_code;
                }
            }
        }
    }
});

watch(selectedDeliveryType, (newVal) => {
    if (newVal === 'Delivery') {
        isAddressExpanded.value = true;
        if (provinces.value.length === 0) {
            fetchProvinces();
        }
    }
});

watch(selectedWard, async (newVal) => {
    if (newVal && selectedDistrict.value) {
        // Approximate weight: 200g per item
        const totalWeight = cart.value.reduce((sum, item) => sum + (item.quantity * 200), 0) || 500;
        const fee = await (fetchFee as any)(selectedDistrict.value, newVal, totalWeight);
        DELIVERY_FEE.value = fee;
    }
});
const selectedCancelReason = ref('');
const customReason = ref('');
const orderToCancel = ref<number | null>(null);
const predefinedReasons = [
    'Changed my mind',
    'Found a better price',
    'Order taking too long',
    'Incorrect items selected',
    'Delivery address error',
    'Other'
];

const openCancelModal = (orderId: number) => {
    orderToCancel.value = orderId;
    isCancelModalOpen.value = true;
    selectedCancelReason.value = 'Changed my mind';
};

const confirmCancelOrder = async () => {
    if (!orderToCancel.value) return;
    const reason = selectedCancelReason.value === 'Other' ? customReason.value : selectedCancelReason.value;
    if (!reason) return;
    
    try {
        await updateOrderStatus(orderToCancel.value, 'Cancelled', undefined, reason);
        if (isStaff.value) {
            await fetchOrders();
        } else {
            await fetchMyOrders();
        }
        isCancelModalOpen.value = false;
        isOrderDetailsOpen.value = false;
        orderToCancel.value = null;
    } catch (err) {
        alert('Failed to cancel order.');
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
            ref="cartButtonRef"
            @click="isCartOpen = true"
            :class="[isCartBouncing ? 'animate-cart-bounce' : '']"
            class="relative group flex items-center gap-3 px-6 py-3 bg-white border border-bakery-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-bakery-200 transition-all duration-300"
        >
            <div class="w-10 h-10 rounded-xl bg-bakery-50 flex items-center justify-center group-hover:bg-bakery-100 transition-colors">
                <ShoppingCart class="w-5 h-5 text-bakery-600" />
            </div>
            <div class="text-left">
                <p class="text-xs font-bold text-bakery-400 uppercase tracking-widest leading-none mb-1">{{ t('shop.yourBasket') }}</p>
                <p class="text-sm font-bold text-bakery-900">{{ formatPrice(totalPrice) }}</p>
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
            {{ isStaff ? t('shop.shopOrders') : t('shop.myOrders') }}
            <span class="ml-1 opacity-60">({{ customerOrders.length }})</span>
        </button>
    </div>

    <!-- Flash Sale Section -->
    <FlashSaleSection 
        v-if="activeFlashSales.length > 0 && activeTab === 'menu'"
        :activeSales="activeFlashSales"
        @add-to-cart="handleFlashSaleAddToCart"
    />




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
                    <div class="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        <div class="glass-card px-3 py-1.5 rounded-xl text-bakery-700 text-xs font-bold uppercase tracking-widest">
                            {{ product.category }}
                        </div>
                        <div v-if="product.flashSale && product.flashSale.sold < product.flashSale.stock" class="bg-red-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter animate-pulse shadow-lg">
                            Flash Sale
                        </div>
                    </div>
                </div>


                <div class="p-6 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-bakery-900 group-hover:text-bakery-600 transition-colors">{{ product.name }}</h3>
                        <div v-if="product.rating" class="flex items-center gap-1.5 bg-bakery-50 text-bakery-700 px-2 py-1 rounded-lg">
                             <Star class="w-4 h-4 fill-bakery-600 text-bakery-600" />
                             <span class="text-sm font-bold">{{ product.rating }}</span>
                             <span class="text-[10px] text-bakery-400">({{ product.totalVotes || 0 }})</span>
                        </div>
                    </div>

                    <div class="mt-auto space-y-5">
                          <div class="flex justify-between items-center">
                             <div class="flex flex-col">
                                <div v-if="product.flashSale && product.flashSale.sold < product.flashSale.stock" class="flex flex-col">
                                    <span class="text-xs text-bakery-400 line-through font-bold">{{ formatPrice(product.price) }}</span>
                                    <span class="text-2xl font-black text-red-600">{{ formatPrice(product.flashSale.salePrice) }}</span>
                                </div>
                                <span v-else class="text-2xl font-black text-bakery-900">{{ formatPrice(product.price) }}</span>
                                <span class="text-xs text-bakery-400 font-bold uppercase tracking-widest">{{ product.stock }} left</span>
                             </div>

                             <div class="flex gap-2">
                                <button @click="openProductDetails(product)" class="w-12 h-12 rounded-2xl border border-bakery-100 text-bakery-600 hover:bg-bakery-50 transition-all flex items-center justify-center shadow-sm">
                                    <Info class="w-5 h-5" />
                                </button>
                                 <button
                                    @click="(e) => handleAddToCart(product, e)"
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
                    <div v-for="(item, idx) in order.items" :key="idx" class="flex justify-between items-center text-xs">
                        <div class="flex items-center gap-2">
                             <img 
                                :src="item.productImage || 'https://placehold.co/100x100?text=No+Image'" 
                                :alt="item.productName"
                                class="w-6 h-6 rounded-md object-cover border border-green-50"
                             />
                             <span class="text-gray-700 font-medium">{{ item.productName }} <span class="text-green-600 ml-1">x{{ item.quantity }}</span></span>
                        </div>
                        <span class="text-gray-900 font-bold">${{ (item.price * item.quantity).toFixed(2) }}</span>
                    </div>
                 </div>
                 <!-- Discount Badge -->
                 <div v-if="order.discountAmount && order.discountAmount > 0" class="mb-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <span class="text-lg">🎟️</span>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-green-700 truncate">Coupon{{ order.couponCode ? ` "${order.couponCode}"` : '' }} Applied</p>
                        <p class="text-xs text-green-600">You saved ${{ order.discountAmount.toFixed(2) }}</p>
                    </div>
                 </div>
                 <div class="flex justify-between items-center mb-4">
                    <span class="text-sm font-medium text-gray-900">{{ t('shop.total') }}</span>
                    <span class="text-lg font-bold text-green-700">{{ formatPrice(order.total) }}</span>
                 </div>
                 <div class="grid grid-cols-1 gap-2 mt-auto">
                    <button 
                        @click="viewOrderDetails(order)"
                        class="w-full h-9 rounded-xl border border-bakery-100 text-bakery-600 text-xs font-bold hover:bg-bakery-50 flex items-center justify-center transition-all"
                    >
                        <Eye class="w-3.5 h-3.5 mr-1.5" /> {{ t('shop.viewDetails') }}
                    </button>
                    
                    <div v-if="order.status === 'Pending' && order.paymentStatus !== 'Paid'" class="grid grid-cols-2 gap-2">
                        <button 
                            @click="router.push(`/payment/${order.id}`)"
                            class="h-9 rounded-xl bg-bakery-900 text-white text-xs font-bold hover:bg-black flex items-center justify-center transition-all shadow-lg shadow-bakery-100"
                        >
                            <CreditCard class="w-3.5 h-3.5 mr-1.5" /> Pay Now
                        </button>
                        <button 
                            @click="openCancelModal(order.id)"
                            class="h-9 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-bold hover:bg-red-100 flex items-center justify-center transition-all"
                        >
                            <Trash2 class="w-3.5 h-3.5 mr-1.5" /> Cancel
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    </div>

    <!-- Global Cart Side Drawer -->
    <div 
        v-if="isCartOpen" 
        class="fixed inset-0 z-110 overflow-hidden"
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
                                    <div class="flex items-center justify-between mt-1">
                                        <div class="flex flex-col">
                                            <span v-if="item.flashSale" class="text-[10px] text-bakery-300 line-through font-bold mb-0.5">{{ formatPrice(item.price * item.quantity) }}</span>
                                            <p :class="item.flashSale ? 'text-red-500' : 'text-bakery-600'" class="font-bold leading-none">
                                                {{ formatPrice(
                                                    item.flashSale 
                                                    ? (Math.min(item.quantity, Math.max(0, item.flashSale.stock - item.flashSale.sold)) * item.flashSale.salePrice) + (Math.max(0, item.quantity - Math.max(0, item.flashSale.stock - item.flashSale.sold)) * item.price)
                                                    : (item.price * item.quantity)
                                                ) }}
                                            </p>
                                        </div>
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
                         <!-- Staff specific input -->
                         <div v-if="isStaff" class="space-y-3 relative">
                              <label class="text-xs font-black text-bakery-400 uppercase tracking-widest">{{ t('shop.customerInfo') }}</label>
                              <div class="relative group">
                                  <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bakery-400" />
                                  <input 
                                    v-model="staffSearchQuery" 
                                    @input="handleStaffNameInput"
                                    @focus="isSearchingUser = true"
                                    @blur="handleStaffBlur"
                                    type="text" 
                                    placeholder="Search user or enter name..." 
                                    class="w-full h-12 rounded-2xl border border-bakery-100 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-bakery-300 text-sm bg-bakery-50/50 transition-all font-medium"
                                  >
                                  <!-- User search results -->
                                  <div v-if="isSearchingUser && filteredSystemUsers.length > 0" class="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-bakery-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                      <div class="p-2">
                                          <button 
                                            v-for="sysUser in filteredSystemUsers" 
                                            :key="sysUser.id"
                                            @click="selectStaffCustomer(sysUser)"
                                            class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bakery-50 transition-colors text-left"
                                          >
                                              <div class="w-10 h-10 rounded-full bg-bakery-100 flex items-center justify-center text-bakery-700 font-bold">
                                                  {{ sysUser.name.charAt(0) }}
                                              </div>
                                              <div>
                                                  <p class="text-sm font-bold text-bakery-900">{{ sysUser.name }}</p>
                                                  <p class="text-xs text-bakery-400">{{ sysUser.email }}</p>
                                              </div>
                                              <div v-if="selectedUserId === sysUser.id" class="ml-auto text-bakery-600">
                                                  <Plus class="w-4 h-4 rotate-45" /> <!-- Using plus icon rotated as a mark, or check if available -->
                                              </div>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                              <div v-if="selectedUserId" class="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl border border-green-100 text-[10px] text-green-700 font-bold animate-in zoom-in">
                                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  Linking to Registered User Account
                              </div>
                         </div>
                         
                         <!-- Delivery Option Toggle -->
                         <div class="space-y-3">
                              <label class="text-xs font-black text-bakery-400 uppercase tracking-widest">Delivery Choice</label>
                              <div class="grid grid-cols-2 gap-2 bg-bakery-50 p-1.5 rounded-2xl border border-bakery-100">
                                   <button 
                                        @click="selectedDeliveryType = 'Pick-up'"
                                        :class="[selectedDeliveryType === 'Pick-up' ? 'bg-white text-bakery-900 shadow-sm' : 'text-bakery-400 hover:text-bakery-600']"
                                        class="h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                   >
                                        <MapPin class="w-3.5 h-3.5" /> Pick-up
                                   </button>
                                   <button 
                                        @click="selectedDeliveryType = 'Delivery'"
                                        :class="[selectedDeliveryType === 'Delivery' ? 'bg-white text-bakery-900 shadow-sm' : 'text-bakery-400 hover:text-bakery-600']"
                                        class="h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                   >
                                        <Truck class="w-3.5 h-3.5" /> Delivery
                                   </button>
                              </div>
                              <div v-if="selectedDeliveryType === 'Delivery'" class="bg-bakery-50 rounded-2xl border border-bakery-100 overflow-hidden transition-all duration-300">
                                   <!-- Collapsible Header -->
                                   <div 
                                        @click="isAddressExpanded = !isAddressExpanded"
                                        class="p-4 flex items-center justify-between cursor-pointer hover:bg-bakery-100/30 transition-colors select-none"
                                   >
                                        <div class="flex items-center gap-3 min-w-0">
                                             <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-bakery-600 shadow-xs shrink-0">
                                                  <MapPin class="w-4 h-4" />
                                             </div>
                                             <div class="text-left min-w-0">
                                                  <p class="text-[10px] font-black text-bakery-400 uppercase tracking-widest leading-none mb-1">Delivery Address</p>
                                                  <p v-if="!isAddressExpanded" class="text-xs font-bold text-bakery-700 truncate mt-0.5 animate-in fade-in max-w-[200px]">
                                                       {{ streetAddress || 'Click to set address...' }}
                                                  </p>
                                             </div>
                                        </div>
                                        <button class="text-bakery-400 hover:text-bakery-900 transition-colors ml-2">
                                             <ChevronUp v-if="isAddressExpanded" class="w-4 h-4" />
                                             <ChevronDown v-else class="w-4 h-4" />
                                        </button>
                                   </div>

                                   <!-- Expandable Body Content -->
                                   <div v-show="isAddressExpanded" class="p-4 pt-0 border-t border-bakery-100/50 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <input 
                                            v-model="streetAddress" 
                                            type="text" 
                                            placeholder="Enter street name, house number..." 
                                            class="w-full mt-2 border-b border-bakery-100 bg-transparent text-xs font-bold text-bakery-900 focus:outline-none focus:border-bakery-400 pb-1 placeholder:text-bakery-300"
                                        />
                                        <div class='grid grid-cols-1 gap-2'>
                                             <select v-model='selectedProvince' @change='fetchDistricts(selectedProvince!)' class='w-full h-8 rounded-lg border border-bakery-100 px-3 text-[10px] bg-white font-bold opacity-80 focus:opacity-100'>
                                                  <option :value='null' disabled>Province</option>
                                                  <option v-for='p in provinces' :key='p.ProvinceID' :value='p.ProvinceID'>{{p.ProvinceName}}</option>
                                             </select>
                                             <select v-if='selectedProvince' v-model='selectedDistrict' @change='fetchWards(selectedDistrict!)' class='w-full h-8 rounded-lg border border-bakery-100 px-3 text-[10px] bg-white font-bold opacity-80 focus:opacity-100'>
                                                  <option :value='null' disabled>District</option>
                                                  <option v-for='d in districts' :key='d.DistrictID' :value='d.DistrictID'>{{d.DistrictName}}</option>
                                             </select>
                                             <select v-if='selectedDistrict' v-model='selectedWard' class='w-full h-8 rounded-lg border border-bakery-100 px-3 text-[10px] bg-white font-bold opacity-80 focus:opacity-100'>
                                                  <option :value='null' disabled>Ward</option>
                                                  <option v-for='w in wards' :key='w.WardCode' :value='w.WardCode'>{{w.WardName}}</option>
                                             </select>
                                        </div>

                                        <!-- Map block inside collapsible area -->
                                        <div class="h-32 rounded-xl overflow-hidden shadow-xs border border-bakery-100 relative group">
                                             <iframe 
                                                 :key="mapUrl"
                                                 width="100%" 
                                                 height="100%" 
                                                 style="border:0;" 
                                                 loading="lazy" 
                                                 allowfullscreen 
                                                 :src="mapUrl">
                                             </iframe>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         
                         <div class="space-y-4">
                             <!-- Coupon Section -->
                             <div class="space-y-2">
                                 <label class="text-xs font-black text-bakery-400 uppercase tracking-widest">Promo Code</label>
                                 <div class="flex gap-2">
                                      <input 
                                          v-model="couponCodeInput" 
                                          :disabled="!!appliedCoupon"
                                          type="text" 
                                          placeholder="Enter code..." 
                                          class="flex-1 h-10 rounded-xl border border-bakery-100 px-3 focus:outline-none focus:ring-2 focus:ring-bakery-300 text-sm bg-bakery-50/50 uppercase"
                                      >
                                      <button 
                                          v-if="!appliedCoupon"
                                          @click="applyCoupon"
                                          :disabled="isApplyingCoupon || !couponCodeInput"
                                          class="px-4 h-10 bg-bakery-900 text-white text-sm font-bold rounded-xl hover:bg-bakery-800 disabled:opacity-50 transition-colors"
                                      >
                                          {{ isApplyingCoupon ? '...' : 'Apply' }}
                                      </button>
                                      <button 
                                          v-else
                                          @click="removeCoupon"
                                          class="px-4 h-10 bg-red-100 text-red-700 text-sm font-bold rounded-xl hover:bg-red-200 transition-colors"
                                      >
                                          Remove
                                      </button>
                                 </div>
                                 <p v-if="couponError" class="text-xs text-red-500 font-medium">{{ couponError }}</p>
                                 <p v-if="appliedCoupon" class="text-xs text-green-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                     Applied: -{{ formatPrice(discountAmount) }} off
                                 </p>
                             </div>

                             <div class="space-y-3 pt-3 border-t border-bakery-100">
                                 <div class="flex justify-between items-center text-bakery-500 font-medium text-sm">
                                      <span>Subtotal</span>
                                      <span>{{ formatPrice(subTotalPrice) }}</span>
                                 </div>
                                 <div v-if="appliedCoupon" class="flex justify-between items-center text-green-600 font-medium text-sm">
                                      <span>Discount ({{ appliedCoupon.code }})</span>
                                      <span>-{{ formatPrice(discountAmount) }}</span>
                                  </div>
                                  <div v-if="selectedDeliveryType === 'Delivery'" class="flex justify-between items-center text-bakery-500 font-medium text-sm">
                                       <span>Delivery Fee</span>
                                       <span>{{ formatPrice(DELIVERY_FEE) }}</span>
                                  </div>
                                  <div class="flex justify-between items-center text-2xl font-black text-bakery-900 pt-2 border-t border-bakery-100">
                                      <span>{{ t('shop.total') }}</span>
                                      <span>{{ formatPrice(totalPrice) }}</span>
                                 </div>
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
                            <span class="text-2xl font-bold text-green-900">{{ formatPrice(selectedProduct.price) }}</span>
                            <div v-if="selectedProduct.rating" class="flex items-center gap-1 text-sm font-medium bg-green-50 text-green-800 px-2 py-1 rounded">
                                <Star class="w-4 h-4 fill-green-600 text-green-600" /> {{ selectedProduct.rating }} / 5.0 ({{ selectedProduct.totalVotes || 0 }} votes)
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

                    <!-- Rating Section -->
                    <div class="bg-bakery-50/50 p-4 rounded-2xl border border-bakery-100">
                        <h3 class="font-bold text-bakery-900 mb-2 flex items-center gap-2">
                             Rate this treat
                             <span v-if="isSubmittingRating" class="text-xs font-normal text-bakery-500 animate-pulse">Submitting...</span>
                        </h3>
                        <div class="flex items-center gap-2">
                            <div class="flex gap-1">
                                <button 
                                    v-for="i in 5" 
                                    :key="i"
                                    @click="handleRateProduct(i)"
                                    @mouseenter="hoverRating = i"
                                    @mouseleave="hoverRating = 0"
                                    class="transition-transform active:scale-90"
                                >
                                    <Star 
                                        :class="[
                                            'w-8 h-8 transition-colors',
                                            (hoverRating || userRating) >= i 
                                                ? 'fill-bakery-600 text-bakery-600' 
                                                : 'text-bakery-200'
                                        ]" 
                                    />
                                </button>
                            </div>
                            <span class="text-sm font-bold text-bakery-700 ml-2" v-if="hoverRating || userRating">
                                {{ hoverRating || userRating }} / 5
                            </span>
                            <p v-else class="text-xs text-bakery-400 ml-2">Tap stars to vote</p>
                        </div>
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
                    @click="(e) => addToCartFromDialogExtended(e)"
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

                <!-- Cancellation Reason -->
                <div v-if="viewingOrder.status === 'Cancelled' && viewingOrder.cancel_reason" class="bg-red-50 border border-red-100 p-4 rounded-xl">
                    <div class="flex items-center gap-2 text-red-700 font-bold mb-1 uppercase tracking-wider text-xs">
                        <XCircle class="w-4 h-4" />
                        <span>Cancellation Reason</span>
                    </div>
                    <p class="text-sm text-red-600 font-medium">{{ viewingOrder.cancel_reason }}</p>
                </div>

                <!-- Live Tracking Section -->
                <div v-if="viewingOrder.deliveryType === 'Delivery'" class="animate-in fade-in slide-in-from-top-4 duration-700 mb-6">
                    <DeliveryTracker :order-id="viewingOrder.id" :active="isOrderDetailsOpen" :destination="viewingOrder.address" />
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
                                    <div class="col-span-6 flex items-center gap-3">
                                        <img 
                                            :src="item.productImage || 'https://placehold.co/100x100?text=No+Image'" 
                                            :alt="item.productName"
                                            class="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm"
                                        />
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">{{ item.productName }}</p>
                                        </div>
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
                            <span class="text-gray-600 font-medium">Total Bill</span>
                            <span class="font-bold text-gray-900 border-b-2 border-green-100 pb-0.5">{{ formatPrice(viewingOrder.total + (viewingOrder.discountAmount || 0)) }}</span>
                        </div>
                        <div v-if="viewingOrder.discountAmount && viewingOrder.discountAmount > 0" class="flex justify-between text-sm">
                            <span class="text-emerald-700 font-medium flex items-center gap-1">
                                <span class="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Coupon</span>
                                <span v-if="viewingOrder.couponCode" class="font-bold">"{{ viewingOrder.couponCode }}"</span>
                            </span>
                            <span class="font-bold text-emerald-700">-{{ formatPrice(viewingOrder.discountAmount) }}</span>
                        </div>
                        <div v-if="viewingOrder.paymentMethod" class="flex justify-between text-sm pt-2 border-t border-green-200/50">
                            <span class="text-gray-500 font-medium">Payment Method</span>
                            <span class="font-bold text-green-900 capitalize">
                                {{ viewingOrder.paymentMethod === 'cash' 
                                    ? (viewingOrder.deliveryType === 'Delivery' ? 'Pay when receive' : 'Pay at Counter') 
                                    : viewingOrder.paymentMethod }}
                            </span>
                        </div>
                        <div class="pt-2 border-t border-green-300 flex justify-between items-center">
                            <span class="font-bold text-gray-900">Total</span>
                            <span class="text-2xl font-bold text-green-700">${{ viewingOrder.total.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <div v-if="viewingOrder.status === 'Pending' && viewingOrder.paymentStatus !== 'Paid'" class="mr-auto flex gap-2">
                    <button 
                         @click="router.push(`/payment/${viewingOrder.id}`)"
                         class="px-4 py-2 rounded-lg bg-bakery-900 text-white font-bold text-sm hover:bg-black shadow-lg transition-all flex items-center gap-2"
                    >
                        <CreditCard class="w-4 h-4" /> Pay Now
                    </button>
                    <button 
                        @click="openCancelModal(viewingOrder.id)"
                        class="px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2"
                    >
                        <Trash2 class="w-4 h-4" /> Cancel Order
                    </button>
                </div>
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
    <div v-if="showLoginPrompt" class="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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

    <!-- Flying animation overlay -->
    <div v-for="fly in flyingItems" :key="fly.id" 
        class="fly-to-cart w-12 h-12 rounded-full overflow-hidden border-2 border-bakery-500 shadow-2xl bg-white"
        :style="{
            left: (fly.flying ? fly.targetX : fly.x) + 'px',
            top: (fly.flying ? fly.targetY : fly.y) + 'px',
            opacity: fly.flying ? 0 : 1,
            transform: fly.flying ? 'scale(0.2) rotate(720deg)' : 'scale(1) rotate(0deg)'
        }"
    >
        <img :src="fly.image" class="w-full h-full object-cover">
    </div>

    <!-- Cancel Reason Modal -->
    <div v-if="isCancelModalOpen" class="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
                <h3 class="text-lg font-bold text-red-900 flex items-center gap-2">
                    <XCircle class="w-5 h-5" /> Cancel Order #{{ orderToCancel }}
                </h3>
                <button @click="isCancelModalOpen = false" class="text-gray-400 hover:text-gray-600"><XCircle class="w-6 h-6" /></button>
            </div>
            
            <div class="p-6 space-y-4">
                <p class="text-sm text-gray-600 font-medium">Why are you cancelling your order?</p>
                
                <div class="space-y-2">
                    <label v-for="reason in predefinedReasons" :key="reason" class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors has-checked:bg-red-50 has-checked:border-red-200">
                        <input 
                            type="radio" 
                            v-model="selectedCancelReason" 
                            :value="reason"
                            class="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                        >
                        <span class="text-sm font-medium text-gray-700">{{ reason }}</span>
                    </label>
                </div>

                <div v-if="selectedCancelReason === 'Other'" class="animate-in slide-in-from-top-2 duration-200">
                    <textarea 
                        v-model="customReason" 
                        placeholder="Please tell us more..."
                        class="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                        rows="3"
                    ></textarea>
                </div>
            </div>

            <div class="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
                <button 
                    @click="isCancelModalOpen = false"
                    class="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all font-premium"
                >
                    Nevermind
                </button>
                <button 
                    @click="confirmCancelOrder"
                    :disabled="selectedCancelReason === 'Other' && !customReason.trim()"
                    class="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
                >
                    Cancel Order
                </button>
            </div>
        </div>
    </div>
</div>
</template>


