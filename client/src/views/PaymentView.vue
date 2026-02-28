<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
    CreditCard, 
    Wallet, 
    CheckCircle2, 
    ArrowLeft, 
    QrCode, 
    Check,
    Receipt,
    Clock,
    Shield,
    Leaf,
    Cookie,
    Cake,
    Coffee,
    Lock
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
    <div class="min-h-screen bg-accent-cream relative overflow-hidden flex flex-col pt-12 md:pt-20">
        <!-- Modern Decorative Background -->
        <div class="fixed inset-0 pointer-events-none">
            <!-- Glass Orbs -->
            <div class="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-bakery-200/30 blur-[120px] rounded-full animate-float" style="animation-duration: 8s"></div>
            <div class="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-100/40 blur-[150px] rounded-full animate-float" style="animation-duration: 12s; animation-delay: -2s"></div>
            <div class="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-bakery-100/50 blur-[100px] rounded-full animate-float" style="animation-duration: 10s; animation-delay: -5s"></div>
            
            <!-- Floating Bakery Icons -->
            <Cake class="absolute top-[15%] left-[10%] w-16 h-16 text-bakery-200/40 rotate-12 animate-float" style="animation-duration: 9s" />
            <Cookie class="absolute bottom-[20%] right-[15%] w-12 h-12 text-bakery-300/30 -rotate-12 animate-float" style="animation-duration: 7s; animation-delay: -1s" />
            <Coffee class="absolute top-[60%] left-[5%] w-10 h-10 text-bakery-200/20 rotate-45 animate-float" style="animation-duration: 11s" />
            <Leaf class="absolute top-[10%] right-[25%] w-8 h-8 text-bakery-400/20 animate-float" style="animation-duration: 6s" />
        </div>

        <div class="container mx-auto px-4 sm:px-8 max-w-5xl z-10">
            <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                
                <!-- Left: Order Summary -->
                <div class="flex flex-col gap-6 lg:sticky lg:top-12 self-start">
                    <button 
                        @click="router.back()" 
                        class="group flex items-center gap-2 text-bakery-600 font-black hover:text-bakery-900 transition-all w-fit"
                    >
                        <div class="w-8 h-8 rounded-full border-2 border-bakery-200 flex items-center justify-center group-hover:bg-bakery-50 transition-all">
                            <ArrowLeft class="w-4 h-4" />
                        </div>
                        {{ t('common.back') }}
                    </button>
                    
                    <div class="glass-card rounded-[3rem] border border-white/40 p-10 premium-shadow space-y-10 relative overflow-hidden">
                        <!-- Decorative glow -->
                        <div class="absolute -top-10 -right-10 w-32 h-32 bg-bakery-50 blur-3xl opacity-50"></div>
                        
                        <div class="flex items-center gap-5 relative">
                            <div class="w-14 h-14 rounded-2xl bg-bakery-900 flex items-center justify-center shadow-lg shadow-bakery-900/20">
                                <Receipt class="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 class="text-2xl font-black text-bakery-900">{{ t('orders.orderDetails') }}</h2>
                                <p class="text-bakery-500 font-black text-xs uppercase tracking-widest mt-1">Order #{{ orderId }}</p>
                            </div>
                        </div>

                        <div v-if="order" class="space-y-8 relative">
                            <div class="space-y-5 max-h-[300px] overflow-y-auto pr-4 scrollbar-custom">
                                <div v-for="(item, idx) in order.items" :key="idx" class="flex justify-between items-center group/item hover:bg-bakery-50/50 p-3 -mx-3 rounded-2xl transition-all">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-xl bg-white border border-bakery-100 flex items-center justify-center text-sm font-black text-bakery-900 shadow-sm group-hover/item:border-bakery-300">
                                            {{ item.quantity }}
                                        </div>
                                        <div>
                                            <p class="text-bakery-900 font-bold group-hover/item:text-bakery-600 transition-colors">{{ item.productName }}</p>
                                            <p class="text-[10px] text-bakery-400 font-black tracking-wider uppercase">${{ item.price.toFixed(2) }} each</p>
                                        </div>
                                    </div>
                                    <span class="text-bakery-900 font-black tracking-tight">${{ item.subtotal.toFixed(2) }}</span>
                                </div>
                            </div>

                            <div class="pt-8 border-t border-bakery-100/50 space-y-4">
                                <div class="flex justify-between text-bakery-400 font-black uppercase tracking-[0.2em] text-[10px]">
                                    <span>Base Subtotal</span>
                                    <span>${{ order.total.toFixed(2) }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-lg font-black text-bakery-900">Amount to Pay</span>
                                    <span class="text-4xl font-black text-bakery-900 tracking-tighter">${{ order.total.toFixed(2) }}</span>
                                </div>
                            </div>

                            <div class="p-4 rounded-2xl bg-linear-to-br from-green-50 to-bakery-50/50 border border-green-100/50 flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                    <Shield class="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p class="text-[11px] font-black text-bakery-900 uppercase tracking-wider leading-none">Buyer Protection</p>
                                    <p class="text-[10px] font-medium text-bakery-500 mt-1">Encrypted • Secure • Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Side Trust Badges -->
                    <div class="flex items-center justify-center gap-6 px-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" class="h-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" class="h-6">
                        <div class="w-px h-4 bg-bakery-200"></div>
                        <div class="flex items-center gap-2 text-[10px] font-black text-bakery-400 uppercase tracking-widest">
                            <Lock class="w-3 h-3" /> PCI DSS Compliant
                        </div>
                    </div>
                </div>

                <!-- Right: Payment Methods Container -->
                <div class="relative min-h-[600px] flex flex-col">
                    <div class="glass-card rounded-[3.5rem] border border-white/60 p-10 md:p-14 premium-shadow flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                        
                        <!-- Background Glow -->
                        <div class="absolute bottom-0 right-0 w-64 h-64 bg-bakery-50 blur-3xl opacity-30 -mr-20 -mb-20"></div>

                        <!-- IDLE State -->
                        <div v-if="paymentStatus === 'idle' && !showQR" class="w-full space-y-12 animate-in fade-in zoom-in slide-in-from-right-10 duration-700">
                            <div class="text-center space-y-3">
                                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bakery-900 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                                    <Lock class="w-3 h-3" /> Checkout
                                </div>
                                <h1 class="text-4xl font-black text-bakery-900 tracking-tight leading-none">{{ t('shop.paymentTitle') }}</h1>
                                <p class="text-bakery-500 font-bold text-lg tracking-tight">{{ t('shop.selectPayment') }}</p>
                            </div>

                            <div class="grid grid-cols-1 gap-4">
                                <!-- MoMo -->
                                <button 
                                    @click="selectedMethod = 'momo'"
                                    :class="[
                                        'group relative w-full p-6 rounded-[2.5rem] border-2 transition-all duration-500 flex items-center justify-between overflow-hidden',
                                        selectedMethod === 'momo' ? 'border-pink-500 bg-white shadow-2xl shadow-pink-100/50 scale-[1.02]' : 'border-bakery-100 bg-white hover:border-pink-300 hover:scale-[1.01]'
                                    ]"
                                >
                                    <!-- Selection Indicator Blur -->
                                    <div v-if="selectedMethod === 'momo'" class="absolute inset-0 bg-linear-to-r from-pink-500/5 to-transparent"></div>
                                    
                                    <div class="flex items-center gap-5 relative">
                                        <div class="w-14 h-14 rounded-3xl bg-[#D82D8B] flex items-center justify-center p-2 shadow-lg shadow-pink-200 group-hover:rotate-6 transition-transform">
                                            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" class="w-full h-full object-contain brightness-0 invert">
                                        </div>
                                        <div class="text-left">
                                            <p class="font-black text-bakery-900 text-lg">{{ t('shop.payWithMoMo') }}</p>
                                            <div class="flex items-center gap-2">
                                                <span class="text-[9px] font-black text-pink-600 uppercase tracking-widest bg-pink-50 px-2 py-0.5 rounded-md">Digital Wallet</span>
                                                <span class="text-[9px] font-bold text-green-500 flex items-center gap-1"><CheckCircle2 class="w-2.5 h-2.5" /> Instant</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div :class="['w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative', selectedMethod === 'momo' ? 'bg-pink-500 border-pink-500' : 'border-bakery-100 group-hover:border-pink-300']">
                                        <Check v-if="selectedMethod === 'momo'" class="w-5 h-5 text-white" />
                                    </div>
                                </button>

                                <!-- ZaloPay -->
                                <button 
                                    @click="selectedMethod = 'zalopay'"
                                    :class="[
                                        'group relative w-full p-6 rounded-[2.5rem] border-2 transition-all duration-500 flex items-center justify-between overflow-hidden',
                                        selectedMethod === 'zalopay' ? 'border-blue-500 bg-white shadow-2xl shadow-blue-100/50 scale-[1.02]' : 'border-bakery-100 bg-white hover:border-blue-300 hover:scale-[1.01]'
                                    ]"
                                >
                                    <div v-if="selectedMethod === 'zalopay'" class="absolute inset-0 bg-linear-to-r from-blue-500/5 to-transparent"></div>
                                    
                                    <div class="flex items-center gap-5 relative">
                                        <div class="w-14 h-14 rounded-3xl bg-[#0088FF] flex items-center justify-center p-2 shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
                                            <img src="https://static-znews.pstatic.vn/images/zalopay.png" alt="ZaloPay" class="w-full h-full object-contain brightness-0 invert">
                                        </div>
                                        <div class="text-left">
                                            <p class="font-black text-bakery-900 text-lg">{{ t('shop.payWithZaloPay') }}</p>
                                            <div class="flex items-center gap-2">
                                                <span class="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">Cashless Pay</span>
                                                <span class="text-[9px] font-bold text-green-500 flex items-center gap-1"><CheckCircle2 class="w-2.5 h-2.5" /> Fast</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div :class="['w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative', selectedMethod === 'zalopay' ? 'bg-blue-500 border-blue-500' : 'border-bakery-100 group-hover:border-blue-300']">
                                        <Check v-if="selectedMethod === 'zalopay'" class="w-5 h-5 text-white" />
                                    </div>
                                </button>

                                <!-- Cash -->
                                <button 
                                    @click="selectedMethod = 'cash'"
                                    :class="[
                                        'group relative w-full p-6 rounded-[2.5rem] border-2 transition-all duration-500 flex items-center justify-between overflow-hidden',
                                        selectedMethod === 'cash' ? 'border-bakery-800 bg-white shadow-2xl shadow-bakery-100/50 scale-[1.02]' : 'border-bakery-100 bg-white hover:border-bakery-300 hover:scale-[1.01]'
                                    ]"
                                >
                                     <div v-if="selectedMethod === 'cash'" class="absolute inset-0 bg-linear-to-r from-bakery-800/5 to-transparent"></div>
                                    
                                    <div class="flex items-center gap-5 relative">
                                        <div class="w-14 h-14 rounded-3xl bg-bakery-900 flex items-center justify-center shadow-lg shadow-bakery-200 group-hover:rotate-6 transition-transform">
                                            <Wallet class="w-7 h-7 text-white" />
                                        </div>
                                        <div class="text-left">
                                            <p class="font-black text-bakery-900 text-lg">{{ t('shop.payWithCash') }}</p>
                                            <div class="flex items-center gap-2">
                                                <span class="text-[9px] font-black text-bakery-600 uppercase tracking-widest bg-bakery-50 px-2 py-0.5 rounded-md">Traditional</span>
                                                <span class="text-[9px] font-bold text-amber-600 flex items-center gap-1"><Clock class="w-2.5 h-2.5" /> Pay at Pickup</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div :class="['w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative', selectedMethod === 'cash' ? 'bg-bakery-900 border-bakery-900' : 'border-bakery-100 group-hover:border-bakery-300']">
                                        <Check v-if="selectedMethod === 'cash'" class="w-5 h-5 text-white" />
                                    </div>
                                </button>
                            </div>

                            <button 
                                @click="handlePayment"
                                :disabled="!selectedMethod"
                                class="group w-full h-18 rounded-4xl bg-bakery-900 text-white font-black text-xl hover:bg-black shadow-[0_20px_40px_-10px_rgba(42,53,33,0.3)] transition-all disabled:opacity-30 active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden"
                            >
                                <!-- Shimmer Effect -->
                                <div class="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                
                                <span class="relative">{{ t('shop.checkout') }}</span>
                                <CreditCard class="w-6 h-6 relative" />
                            </button>
                        </div>

                        <!-- QR Modal Simulation -->
                        <div v-if="showQR && paymentStatus === 'idle'" class="w-full text-center space-y-12 animate-in zoom-in slide-in-from-bottom-5 duration-500">
                            <div class="space-y-6">
                                <div class="inline-flex flex-col items-center">
                                    <h2 class="text-3xl font-black text-bakery-900 tracking-tight">{{ t('shop.scanQR') }}</h2>
                                    <div class="h-1.5 w-12 bg-bakery-200 rounded-full mt-2"></div>
                                </div>
                                <div class="relative inline-block mt-4 p-8 bg-white border-2 border-bakery-50 rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group">
                                    <div class="absolute inset-8 border border-bakery-100 rounded-[3rem] opacity-50"></div>
                                    <QrCode class="w-56 h-56 text-bakery-900 relative" />
                                    
                                    <!-- Dynamic Badge -->
                                    <div class="absolute -top-6 -right-6 w-20 h-20 rounded-4xl flex items-center justify-center shadow-2xl border-4 border-white animate-pop" 
                                        :class="selectedMethod === 'momo' ? 'bg-pink-500' : 'bg-blue-500'">
                                        <img v-if="selectedMethod === 'momo'" src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" class="w-10 h-10 object-contain brightness-0 invert">
                                        <img v-if="selectedMethod === 'zalopay'" src="https://static-znews.pstatic.vn/images/zalopay.png" class="w-10 h-10 object-contain brightness-0 invert">
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-6 max-w-sm mx-auto">
                                <div class="flex items-center justify-center gap-4 py-3 px-6 rounded-2xl bg-bakery-50/50 text-bakery-400 font-black text-xs uppercase tracking-widest border border-bakery-100/50">
                                    <Clock class="w-4 h-4 animate-pulse" />
                                    <span>Transaction expires in 14:59</span>
                                </div>
                                
                                <div class="flex gap-4">
                                    <button 
                                        @click="showQR = false"
                                        class="flex-1 h-14 rounded-2xl border-2 border-bakery-100 text-bakery-600 font-black hover:bg-bakery-50 hover:border-bakery-200 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        @click="completePayment"
                                        class="flex-[2.5] h-14 rounded-2xl bg-bakery-900 text-white font-black hover:bg-black shadow-xl hover:shadow-bakery-200 transition-all text-sm flex items-center justify-center gap-2"
                                    >
                                        {{ t('shop.confirmPayment') }}
                                        <CheckCircle2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- PROCESSING State -->
                        <div v-if="paymentStatus === 'processing'" class="flex flex-col items-center gap-10 animate-in zoom-in duration-700">
                            <div class="relative w-32 h-32 flex items-center justify-center">
                                <!-- Outer rotating ring -->
                                <div class="absolute inset-0 border-4 border-bakery-100 border-t-bakery-600 rounded-full animate-spin"></div>
                                <!-- Inner steady shield -->
                                <div class="w-16 h-16 rounded-3xl bg-bakery-50 flex items-center justify-center shadow-inner">
                                    <Shield class="w-8 h-8 text-bakery-600 animate-pulse" />
                                </div>
                            </div>
                            <div class="text-center space-y-4">
                                <h2 class="text-3xl font-black text-bakery-900 tracking-tight">{{ t('shop.processingPayment') }}</h2>
                                <p class="text-bakery-500 font-bold max-w-xs mx-auto text-lg leading-tight">Securing your transaction with real-time verification...</p>
                            </div>
                        </div>

                        <!-- SUCCESS State -->
                        <div v-if="paymentStatus === 'success'" class="flex flex-col items-center gap-10 animate-in zoom-in duration-700">
                            <div class="w-40 h-40 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-100 relative">
                                <!-- Success particles simulation -->
                                <div class="absolute top-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                                <div class="absolute bottom-4 right-0 w-3 h-3 bg-bakery-400 rounded-full animate-ping" style="animation-delay: 0.5s"></div>
                                
                                <div class="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)] animate-pop">
                                    <Check class="w-12 h-12 text-white stroke-4" />
                                </div>
                            </div>
                            <div class="text-center space-y-4">
                                <h1 class="text-4xl font-black text-bakery-900 tracking-tight">{{ t('shop.paymentSuccess') }}</h1>
                                <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-bakery-900 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                                    Order Confirmed
                                </div>
                                <p class="text-bakery-400 font-bold block pt-4 animate-pulse">Redirecting to history...</p>
                            </div>
                        </div>

                    </div>
                    
                    <!-- View Footer -->
                    <div class="py-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-bakery-200 pointer-events-none">
                        Premium Bakery Experience • Powered by secure gateway
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
