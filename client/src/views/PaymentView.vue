<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, watchEffect } from 'vue';
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
    Lock,
    ExternalLink
} from 'lucide-vue-next';
import { useOrders, type Order } from '../composables/useOrders';
import { useI18n } from '../composables/useI18n';
import { useAuth } from '../composables/useAuth';
import { usePayment } from '../composables/usePayment';
import { useCurrency } from '../composables/useCurrency';
import QRCode from 'qrcode';

const route = useRoute();
const router = useRouter();
const { orders, fetchOrderById } = useOrders();
const { user } = useAuth();
const { t } = useI18n();
const { initiatePayment, verifyPaymentStatus } = usePayment();
const { formatPrice } = useCurrency();

const isCashier = computed(() => user.value?.role?.toLowerCase() === 'cashier' || user.value?.role?.toLowerCase() === 'admin');

const orderId = route.params.id as string;
const order = ref<Order | null>(null);
const selectedMethod = ref<'qr' | 'cash' | null>(null);
const paymentStatus = ref<'idle' | 'processing' | 'success'>('idle');
const showQR = ref(false);
const showCounterWaiting = ref(false);
const paymentConfig = ref({
    bankId: 'vpb',
    accountNumber: '',
    accountName: '',
    messageTemplate: 'Bakery Payment for #{orderId}'
});
const payosUrl = ref('');
const payosData = ref<{
    amount?: number,
    accountNumber?: string,
    bin?: string,
    description?: string,
    accountName?: string,
    paymentLinkId?: string,
    qrCode?: string
} | null>(null);
const qrDataUrl = ref(''); // rendered as <img> src from qrcode library
const timeLeft = ref(900); // 15 minutes in seconds
let timerInterval: any = null;
let pollingInterval: any = null;

const formattedTime = computed(() => {
    const minutes = Math.floor(timeLeft.value / 60);
    const seconds = timeLeft.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timeLeft.value = 900;
    timerInterval = setInterval(() => {
        if (timeLeft.value > 0) {
            timeLeft.value--;
        } else {
            clearInterval(timerInterval);
            showQR.value = false;
            alert('Payment window has expired. Please check your order status in history.');
            router.push('/customer');
        }
    }, 1000);
};

const startPolling = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(async () => {
        if (!order.value) return;
        try {
            const status = await verifyPaymentStatus(order.value.id);
            if (status.payment_status === 'Paid') {
                clearInterval(pollingInterval);
                clearInterval(timerInterval);
                paymentStatus.value = 'success';
                setTimeout(() => {
                    router.push('/customer');
                }, 3000);
            } else if (status.payment_status === 'Cancelled' || status.status === 'Cancelled') {
                // If cancelled (e.g. timeout on PayOS side or manual cancel)
                clearInterval(pollingInterval);
                clearInterval(timerInterval);
                alert('Payment has been cancelled.');
                router.push('/customer');
            }
        } catch (err) {
            console.error('Polling error:', err);
        }
    }, 3000); // Check every 3 seconds
};

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
    if (pollingInterval) clearInterval(pollingInterval);
});

// Watch showQR or showCounterWaiting to start/stop timer and polling
watch([showQR, showCounterWaiting], ([newQR, newCounter]) => {
    if (newQR || newCounter) {
        if (newQR) startTimer();
        startPolling();
    } else {
        if (timerInterval) clearInterval(timerInterval);
        if (pollingInterval) clearInterval(pollingInterval);
    }
});

// Generate QR code as data URL whenever qrCode string changes
watchEffect(async () => {
    const raw = payosData.value?.qrCode;
    if (raw) {
        try {
            qrDataUrl.value = await QRCode.toDataURL(raw, {
                errorCorrectionLevel: 'M',
                margin: 2,
                width: 400,
                color: { dark: '#1a1a1a', light: '#ffffff' }
            });
        } catch (e) {
            console.error('QR generation error:', e);
            qrDataUrl.value = '';
        }
    } else {
        qrDataUrl.value = '';
    }
});

onMounted(async () => {
    // 0. Check for cancel status from PayOS redirect
    if (route.query.status === 'cancelled') {
        alert('Payment has been cancelled.');
        router.push('/customer');
        return;
    }

    // 1. Try to find in cache first
    let found = orders.value.find(o => String(o.id) === orderId);
    
    // 2. If not found, fetch from server
    if (!found && orderId !== 'mock') {
        found = (await fetchOrderById(orderId)) || undefined;
    }
    
    order.value = found || null;
    
    // Fetch payment config
    try {
        const token = localStorage.getItem('token');
        const configRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payment/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (configRes.ok) {
            paymentConfig.value = await configRes.json();
        }
    } catch (e) {
        console.error('Failed to load payment config', e);
    }
    
    if (!order.value) {
        if (orderId === 'mock') {
            order.value = {
                id: 1234,
                customerId: null,
                customerName: 'Guest',
                customerEmail: 'guest@example.com',
                total: 25.50,
                status: 'Pending',
                date: new Date().toLocaleString(),
                items: [
                    { productName: 'Artisan Sourdough', quantity: 2, price: 8.50, subtotal: 17.00 },
                    { productName: 'Croissant', quantity: 3, price: 2.50, subtotal: 7.50 }
                ]
            };
        }
    }

    // Auto-restore PayOS session if order is pending and has a payment link
    if (order.value && order.value.paymentStatus === 'Pending' && (order.value.paymentMethod === 'qr' || order.value.paymentMethod === 'QR (PayOS)') && order.value.transactionId) {
        payosUrl.value = order.value.paymentUrl || '';
        payosData.value = {
            paymentLinkId: order.value.transactionId,
            qrCode: order.value.qrCode  // restore raw qrCode for client-side rendering
        };
        showQR.value = true;
    }
});

const handlePayment = async () => {
    if (!selectedMethod.value || !order.value) return;
    
    try {
        // Initiate in backend
        const res = await initiatePayment(order.value.id, selectedMethod.value);
        
        if (selectedMethod.value === 'qr') {
            if (res.paymentUrl) payosUrl.value = res.paymentUrl;
            // Store all payos details to sync the displayed QR perfectly
            payosData.value = {
                amount: res.amount,
                accountNumber: res.accountNumber,
                bin: res.bin,
                description: res.description,
                accountName: res.accountName,
                paymentLinkId: res.paymentLinkId,
                qrCode: res.qrCode  // raw EMV string for client-side rendering
            };
        }
        
        if (selectedMethod.value === 'cash') {
            showCounterWaiting.value = true;
        } else {
            showQR.value = true;
        }
    } catch (err) {
        console.error('Failed to initiate payment:', err);
        alert('Could not connect to payment service. Please try again.');
    }
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
            <!-- Loading State -->
            <div v-if="!order" class="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div class="w-16 h-16 border-4 border-bakery-200 border-t-bakery-900 rounded-full animate-spin"></div>
                <p class="text-bakery-500 font-bold">Loading order details...</p>
            </div>

            <div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                
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
                                        <div class="relative">
                                            <img 
                                                :src="item.productImage || 'https://placehold.co/100x100?text=No+Image'" 
                                                :alt="item.productName"
                                                class="w-12 h-12 rounded-xl object-cover border border-bakery-100 shadow-sm transition-transform group-hover/item:scale-110"
                                            />
                                            <div class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bakery-900 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                                                {{ item.quantity }}
                                            </div>
                                        </div>
                                        <div>
                                            <p class="text-bakery-900 font-bold group-hover/item:text-bakery-600 transition-colors">{{ item.productName }}</p>
                                            <p class="text-[10px] text-bakery-400 font-black tracking-wider uppercase">{{ formatPrice(Number(item.price || 0)) }} each</p>
                                        </div>
                                    </div>
                                    <span class="text-bakery-900 font-black tracking-tight">{{ formatPrice(Number(item.subtotal || 0)) }}</span>
                                </div>
                            </div>

                            <div class="pt-8 border-t border-bakery-100/50 space-y-4">
                                <div class="flex justify-between text-bakery-400 font-black uppercase tracking-[0.2em] text-[10px]">
                                    <span>Base Subtotal</span>
                                    <span>{{ formatPrice(order.items?.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0) || 0) }}</span>
                                </div>
                                <div v-if="(!isNaN(Number(order.discountAmount)) ? Number(order.discountAmount) : 0) > 0" class="flex justify-between text-green-600 font-black uppercase tracking-[0.2em] text-[10px]">
                                    <span>Discount Amount</span>
                                    <span>-{{ formatPrice(!isNaN(Number(order.discountAmount)) ? Number(order.discountAmount) : 0) }}</span>
                                </div>
                                <div v-if="order.deliveryType === 'Delivery'" class="flex justify-between text-bakery-400 font-black uppercase tracking-[0.2em] text-[10px]">
                                    <span>Delivery Fee</span>
                                    <span>{{ formatPrice(0.5) }}</span>
                                </div>
                                <div class="flex justify-between items-center pt-2">
                                    <span class="text-lg font-black text-bakery-900">Amount to Pay</span>
                                    <span class="text-4xl font-black text-bakery-900 tracking-tighter">{{ formatPrice(order.total) }}</span>
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
                        <div v-if="paymentStatus === 'idle' && !showQR && !showCounterWaiting" class="w-full space-y-12 animate-in fade-in zoom-in slide-in-from-right-10 duration-700">
                            <div class="text-center space-y-3">
                                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bakery-900 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                                    <Lock class="w-3 h-3" /> Checkout
                                </div>
                                <h1 class="text-4xl font-black text-bakery-900 tracking-tight leading-none">{{ t('shop.paymentTitle') }}</h1>
                                <p class="text-bakery-500 font-bold text-lg tracking-tight">{{ t('shop.selectPayment') }}</p>
                            </div>

                            <div class="grid grid-cols-1 gap-4">
                                <!-- QR Payment -->
                                <button 
                                    @click="selectedMethod = 'qr'"
                                    :class="[
                                        'group relative w-full p-6 rounded-[2.5rem] border-2 transition-all duration-500 flex items-center justify-between overflow-hidden',
                                        selectedMethod === 'qr' ? 'border-bakery-900 bg-white shadow-2xl shadow-bakery-100/50 scale-[1.02]' : 'border-bakery-100 bg-white hover:border-bakery-300 hover:scale-[1.01]'
                                    ]"
                                >
                                    <div v-if="selectedMethod === 'qr'" class="absolute inset-0 bg-linear-to-r from-bakery-900/5 to-transparent"></div>
                                    
                                    <div class="flex items-center gap-5 relative">
                                        <div class="w-14 h-14 rounded-3xl bg-bakery-900 flex items-center justify-center shadow-lg shadow-bakery-200 group-hover:rotate-6 transition-transform">
                                            <QrCode class="w-7 h-7 text-white" />
                                        </div>
                                        <div class="text-left">
                                            <p class="font-black text-bakery-900 text-lg">Scan QR to Pay</p>
                                            <div class="flex items-center gap-2">
                                                <span class="text-[9px] font-black text-bakery-600 uppercase tracking-widest bg-bakery-50 px-2 py-0.5 rounded-md">Mobile Banking & Wallets</span>
                                                <span class="text-[9px] font-bold text-green-500 flex items-center gap-1"><CheckCircle2 class="w-2.5 h-2.5" /> Instant</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div :class="['w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative', selectedMethod === 'qr' ? 'bg-bakery-900 border-bakery-900' : 'border-bakery-100 group-hover:border-bakery-300']">
                                        <Check v-if="selectedMethod === 'qr'" class="w-5 h-5 text-white" />
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
                                        <div class="w-14 h-14 rounded-3xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-200 group-hover:rotate-6 transition-transform">
                                            <Wallet class="w-7 h-7 text-white" />
                                        </div>
                                        <div class="text-left">
                                            <p class="font-black text-bakery-900 text-lg">{{ order?.deliveryType === 'Delivery' && !isCashier ? 'Pay when receive' : 'Pay at Counter' }}</p>
                                            <div class="flex items-center gap-2">
                                                <span class="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md">Cash / Physical Card</span>
                                                <span class="text-[9px] font-bold text-amber-600 flex items-center gap-1"><Clock class="w-2.5 h-2.5" /> {{ order?.deliveryType === 'Delivery' && !isCashier ? 'Cash on Delivery' : 'Pay at Pickup' }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div :class="['w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative', selectedMethod === 'cash' ? 'bg-amber-600 border-amber-600' : 'border-bakery-100 group-hover:border-bakery-300']">
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
                                <div class="relative inline-block mt-4 overflow-hidden rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-white group border-4 border-white">
                                    <img v-if="qrDataUrl" :src="qrDataUrl" class="w-80 h-80 object-contain relative" alt="Payment QR Code" />
                                    <div v-else class="w-80 h-80 flex items-center justify-center bg-bakery-50">
                                        <QrCode class="w-32 h-32 text-bakery-200" />
                                    </div>
                                    
                                    <!-- Scanning Overlay Effect -->
                                    <div class="absolute inset-x-0 top-0 h-1 bg-bakery-900/50 blur-sm animate-[scan_3s_ease-in-out_infinite] pointer-events-none"></div>
                                </div>
                                
                                <!-- Text Help for User -->
                                <div class="mt-6 text-bakery-900 font-bold space-y-1">
                                    <p class="text-sm opacity-60 uppercase tracking-widest font-black">Transfer Details</p>
                                    <p class="text-lg">{{ paymentConfig.accountName }}</p>
                                    <p class="text-bakery-500 font-mono">{{ paymentConfig.accountNumber }} ({{ paymentConfig.bankId.toUpperCase() }})</p>
                                </div>
                            </div>

                            <div class="space-y-6 max-w-sm mx-auto">
                                <div class="flex items-center justify-center gap-4 py-3 px-6 rounded-2xl bg-bakery-50/50 text-bakery-400 font-black text-xs uppercase tracking-widest border border-bakery-100/50">
                                    <Clock class="w-4 h-4 animate-pulse" />
                                    <span>Transaction expires in {{ formattedTime }}</span>
                                </div>

                                <a 
                                    v-if="payosUrl"
                                    :href="payosUrl" 
                                    target="_blank"
                                    class="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-blue-50 text-blue-600 font-black text-sm uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all mb-4"
                                >
                                    <ExternalLink class="w-4 h-4" />
                                    Open Payment Page
                                </a>
                                
                                <div class="flex gap-4">
                                    <button 
                                        @click="showQR = false"
                                        class="flex-1 h-14 rounded-2xl border-2 border-bakery-100 text-bakery-600 font-black hover:bg-bakery-50 hover:border-bakery-200 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Waiting at Counter State -->
                        <div v-if="showCounterWaiting && paymentStatus === 'idle'" class="w-full text-center space-y-12 animate-in zoom-in slide-in-from-bottom-5 duration-500">
                            <div class="space-y-6">
                                <div class="inline-flex flex-col items-center">
                                    <h2 class="text-3xl font-black text-bakery-900 tracking-tight">{{ order?.deliveryType === 'Delivery' && !isCashier ? 'Pay on Delivery' : 'Pay at Counter' }}</h2>
                                    <div class="h-1.5 w-12 bg-amber-200 rounded-full mt-2"></div>
                                </div>
                                <div class="relative inline-block mt-4 p-12 bg-white border-2 border-amber-50 rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]">
                                    <div class="w-48 h-48 bg-amber-50 rounded-[3rem] flex items-center justify-center mb-4 mx-auto">
                                        <Wallet class="w-24 h-24 text-amber-600" />
                                    </div>
                                    <p class="text-bakery-900 font-bold text-lg">{{ order?.deliveryType === 'Delivery' && !isCashier ? 'Please pay the courier upon arrival' : 'Please proceed to the counter' }}</p>
                                    <p class="text-bakery-500 text-sm mt-2">Provide your Order ID: <span class="text-bakery-900 font-black">#{{ orderId }}</span></p>
                                </div>
                                
                                <div class="mt-8 flex flex-col items-center gap-4">
                                    <div class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-50 text-amber-600 font-black text-xs uppercase tracking-widest border border-amber-100">
                                        <div class="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></div>
                                        Waiting for Cashier Confirmation...
                                    </div>
                                    <p class="text-[10px] text-bakery-400 font-bold max-w-xs uppercase tracking-widest">Your screen will update automatically once the cashier processes your payment.</p>
                                </div>
                            </div>

                            <div class="max-w-xs mx-auto">
                                <button 
                                    @click="showCounterWaiting = false"
                                    class="w-full h-14 rounded-2xl border-2 border-bakery-100 text-bakery-600 font-black hover:bg-bakery-50 transition-all text-sm"
                                >
                                    Change Payment Method
                                </button>
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
@keyframes scan {
    0% { top: 0; }
    50% { top: 100%; }
    100% { top: 0; }
}

.animate-scan {
    animation: scan 3s ease-in-out infinite;
}
</style>
