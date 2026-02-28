<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
    CreditCard, 
    Wallet, 
    CheckCircle2, 
    ArrowLeft, 
    QrCode, 
    Loader2,
    Check,
    Receipt,
    Clock,
    Shield
} from 'lucide-vue-next';
import { useOrders, type Order } from '../composables/useOrders';
import { useI18n } from '../composables/useI18n';

const route = useRoute();
const router = useRouter();
const { orders, fetchMyOrders } = useOrders();
const { t } = useI18n();

const orderId = route.params.id as string;
const order = ref<Order | null>(null);
const selectedMethod = ref<'momo' | 'zalopay' | 'cash' | null>(null);
const paymentStatus = ref<'idle' | 'processing' | 'success'>('idle');
const showQR = ref(false);

onMounted(async () => {
    if (orders.value.length === 0) {
        await fetchMyOrders();
    }
    order.value = orders.value.find(o => String(o.id) === orderId) || null;
    
    if (!order.value) {
        // If still not found, could be a guest order or just not in the first page of history
        // For simulation, we'll create a dummy order if id is 'mock'
        if (orderId === 'mock') {
            order.value = {
                id: 1234,
                customerName: 'Guest',
                customerEmail: 'guest@example.com',
                total: 25.50,
                status: 'Pending',
                date: new Date().toLocaleString(),
                items: [
                    { productName: 'Artisan Sourdough', quantity: 2, price: 8.50, subtotal: 17.00 },
                    { productName: 'Croissant', quantity: 3, price: 2.50, subtotal: 7.50 }
                ],
                customerId: null
            };
        }
    }
});

const handlePayment = () => {
    if (!selectedMethod.value) return;
    
    if (selectedMethod.value === 'cash') {
        completePayment();
    } else {
        showQR.value = true;
    }
};

const completePayment = () => {
    paymentStatus.value = 'processing';
    setTimeout(() => {
        paymentStatus.value = 'success';
        setTimeout(() => {
            router.push('/customer');
        }, 3000);
    }, 2000);
};
</script>

<template>
    <div class="min-h-screen bg-accent-cream p-4 sm:p-8 flex items-center justify-center">
        <div class="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5">
            <!-- Left: Order Summary -->
            <div class="space-y-6">
                <button 
                    @click="router.back()" 
                    class="flex items-center gap-2 text-bakery-600 font-bold hover:text-bakery-800 transition-colors"
                >
                    <ArrowLeft class="w-5 h-5" /> {{ t('common.back') }}
                </button>
                
                <div class="glass-card rounded-[2.5rem] border border-bakery-100 p-8 premium-shadow space-y-8">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-bakery-50 flex items-center justify-center">
                            <Receipt class="w-6 h-6 text-bakery-600" />
                        </div>
                        <div>
                            <h2 class="text-2xl font-black text-bakery-900">{{ t('orders.orderDetails') }}</h2>
                            <p class="text-bakery-500 font-medium">#{{ orderId }}</p>
                        </div>
                    </div>

                    <div v-if="order" class="space-y-6">
                        <div class="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                            <div v-for="(item, idx) in order.items" :key="idx" class="flex justify-between items-center group">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-bakery-50 flex items-center justify-center text-xs font-bold text-bakery-600">
                                        {{ item.quantity }}x
                                    </div>
                                    <span class="text-bakery-900 font-bold group-hover:text-bakery-600 transition-colors">{{ item.productName }}</span>
                                </div>
                                <span class="text-bakery-600 font-bold">${{ item.subtotal.toFixed(2) }}</span>
                            </div>
                        </div>

                        <div class="pt-6 border-t border-bakery-100 space-y-2">
                            <div class="flex justify-between text-bakery-500 font-bold uppercase tracking-widest text-xs">
                                <span>Subtotal</span>
                                <span>${{ order.total.toFixed(2) }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xl font-black text-bakery-900">{{ t('shop.total') }}</span>
                                <span class="text-3xl font-black text-bakery-600">${{ order.total.toFixed(2) }}</span>
                            </div>
                        </div>

                        <div class="bg-bakery-50/50 p-4 rounded-2xl border border-bakery-100 flex items-center gap-4">
                            <Shield class="w-6 h-6 text-green-600" />
                            <p class="text-xs font-bold text-bakery-700 leading-tight">
                                Your payment is secured with industry-standard encryption.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Payment Methods -->
            <div class="space-y-6">
                <div class="glass-card rounded-[2.5rem] border border-bakery-100 p-8 premium-shadow h-full flex flex-col items-center justify-center min-h-[500px]">
                    
                    <!-- IDLE State: Method Selection -->
                    <div v-if="paymentStatus === 'idle' && !showQR" class="w-full space-y-8 animate-in fade-in zoom-in duration-500">
                        <div class="text-center">
                            <h1 class="text-2xl font-black text-bakery-900">{{ t('shop.paymentTitle') }}</h1>
                            <p class="text-bakery-500 font-medium mt-1">{{ t('shop.selectPayment') }}</p>
                        </div>

                        <div class="space-y-4">
                            <!-- MoMo -->
                            <button 
                                @click="selectedMethod = 'momo'"
                                :class="[
                                    'w-full p-5 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group active:scale-[0.98]',
                                    selectedMethod === 'momo' ? 'border-pink-500 bg-pink-50 shadow-lg shadow-pink-100' : 'border-bakery-50 bg-white hover:border-pink-300'
                                ]"
                            >
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-2xl bg-[#D82D8B] flex items-center justify-center p-2 shadow-inner">
                                        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" class="w-full h-full object-contain brightness-0 invert">
                                    </div>
                                    <div class="text-left">
                                        <p class="font-black text-bakery-900">{{ t('shop.payWithMoMo') }}</p>
                                        <p class="text-xs font-bold text-pink-600 uppercase tracking-widest">Digital Wallet</p>
                                    </div>
                                </div>
                                <div :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', selectedMethod === 'momo' ? 'bg-pink-500 border-pink-500' : 'border-bakery-100 group-hover:border-pink-300']">
                                    <Check v-if="selectedMethod === 'momo'" class="w-4 h-4 text-white" />
                                </div>
                            </button>

                            <!-- ZaloPay -->
                            <button 
                                @click="selectedMethod = 'zalopay'"
                                :class="[
                                    'w-full p-5 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group active:scale-[0.98]',
                                    selectedMethod === 'zalopay' ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100' : 'border-bakery-50 bg-white hover:border-blue-300'
                                ]"
                            >
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-2xl bg-[#0088FF] flex items-center justify-center p-2 shadow-inner">
                                        <img src="https://static-znews.pstatic.vn/images/zalopay.png" alt="ZaloPay" class="w-full h-full object-contain brightness-0 invert">
                                    </div>
                                    <div class="text-left">
                                        <p class="font-black text-bakery-900">{{ t('shop.payWithZaloPay') }}</p>
                                        <p class="text-xs font-bold text-blue-600 uppercase tracking-widest">Instant Pay</p>
                                    </div>
                                </div>
                                <div :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', selectedMethod === 'zalopay' ? 'bg-blue-500 border-blue-500' : 'border-bakery-100 group-hover:border-blue-300']">
                                    <Check v-if="selectedMethod === 'zalopay'" class="w-4 h-4 text-white" />
                                </div>
                            </button>

                            <!-- Cash -->
                            <button 
                                @click="selectedMethod = 'cash'"
                                :class="[
                                    'w-full p-5 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group active:scale-[0.98]',
                                    selectedMethod === 'cash' ? 'border-green-600 bg-green-50 shadow-lg shadow-green-100' : 'border-bakery-50 bg-white hover:border-green-300'
                                ]"
                            >
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center shadow-inner">
                                        <Wallet class="w-6 h-6 text-white" />
                                    </div>
                                    <div class="text-left">
                                        <p class="font-black text-bakery-900">{{ t('shop.payWithCash') }}</p>
                                        <p class="text-xs font-bold text-green-700 uppercase tracking-widest">In-Store</p>
                                    </div>
                                </div>
                                <div :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', selectedMethod === 'cash' ? 'bg-green-600 border-green-600' : 'border-bakery-100 group-hover:border-green-300']">
                                    <Check v-if="selectedMethod === 'cash'" class="w-4 h-4 text-white" />
                                </div>
                            </button>
                        </div>

                        <button 
                            @click="handlePayment"
                            :disabled="!selectedMethod"
                            class="w-full h-14 rounded-3xl bg-bakery-950 text-white font-black text-lg hover:bg-black shadow-2xl transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-3"
                        >
                            {{ t('shop.checkout') }}
                            <CreditCard class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- QR Modal Simulation -->
                    <div v-if="showQR && paymentStatus === 'idle'" class="w-full text-center space-y-8 animate-in zoom-in duration-500">
                        <div class="space-y-4">
                            <h2 class="text-2xl font-black text-bakery-900">{{ t('shop.scanQR') }}</h2>
                            <div class="inline-block p-6 bg-white border-4 border-bakery-100 rounded-[3rem] shadow-2xl relative">
                                <QrCode class="w-48 h-48 text-bakery-950" />
                                <div class="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center shadow-lg border-2 border-white" v-if="selectedMethod === 'momo'">
                                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" class="w-6 h-6 object-contain brightness-0 invert">
                                </div>
                                 <div class="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg border-2 border-white" v-if="selectedMethod === 'zalopay'">
                                    <img src="https://static-znews.pstatic.vn/images/zalopay.png" class="w-6 h-6 object-contain brightness-0 invert">
                                </div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div class="flex items-center justify-center gap-3 text-bakery-500 font-bold">
                                <Clock class="w-5 h-5 animate-pulse" />
                                <span>Expiring in 14:59</span>
                            </div>
                            
                            <div class="flex gap-3">
                                <button 
                                    @click="showQR = false"
                                    class="flex-1 h-12 rounded-2xl border-2 border-bakery-100 text-bakery-600 font-bold hover:bg-bakery-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    @click="completePayment"
                                    class="flex-2 h-12 rounded-2xl bg-bakery-900 text-white font-bold hover:bg-black shadow-lg transition-all"
                                >
                                    {{ t('shop.confirmPayment') }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- PROCESSING State -->
                    <div v-if="paymentStatus === 'processing'" class="flex flex-col items-center gap-6 animate-in zoom-in">
                        <div class="relative w-24 h-24">
                            <Loader2 class="w-24 h-24 text-bakery-600 animate-spin" />
                            <div class="absolute inset-0 flex items-center justify-center">
                                <Shield class="w-8 h-8 text-bakery-400" />
                            </div>
                        </div>
                        <div class="text-center">
                            <h2 class="text-2xl font-black text-bakery-900">{{ t('shop.processingPayment') }}</h2>
                            <p class="text-bakery-500 font-medium">Verifying with gateway...</p>
                        </div>
                    </div>

                    <!-- SUCCESS State -->
                    <div v-if="paymentStatus === 'success'" class="flex flex-col items-center gap-6 animate-in zoom-in">
                        <div class="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center border-4 border-green-200">
                            <CheckCircle2 class="w-12 h-12 text-green-600" />
                        </div>
                        <div class="text-center">
                            <h1 class="text-3xl font-black text-bakery-900">{{ t('shop.paymentSuccess') }}</h1>
                            <p class="text-bakery-500 font-bold uppercase tracking-widest mt-2">Order Confirmed</p>
                        </div>
                        <p class="text-sm font-medium text-bakery-400">Redirecting to your orders...</p>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

.premium-shadow {
    box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 20px 40px -4px rgba(0, 0, 0, 0.05),
        inset 0 2px 4px 0 rgba(255, 255, 255, 0.5);
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
