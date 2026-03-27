<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
    Search, 
    Filter, 
    Eye,
    CheckCircle2, 
    Clock, 
    XCircle, 
    Package,
    ArrowUpRight,
    Utensils
} from 'lucide-vue-next';
import { useOrders, type Order } from '../composables/useOrders';
import DeliveryTracker from '../components/DeliveryTracker.vue';
import { useI18n } from '../composables/useI18n';
import { useCurrency } from '../composables/useCurrency';

const { orders, updateOrderStatus, fetchOrders } = useOrders();
const { t } = useI18n();
const { formatPrice } = useCurrency();

const searchQuery = ref('');
const statusFilter = ref<'all' | 'Pending' | 'Baking' | 'Ready' | 'Completed' | 'Cancelled'>('all');
const viewingOrder = ref<any | null>(null); // Use any to avoid DeepReadonly mismatch with the composable's readonly() wrapper
const isDetailOpen = ref(false);

onMounted(async () => {
    await fetchOrders();
});

const filteredOrders = computed(() => {
    return orders.value.filter(order => {
        const matchesSearch = 
            String(order.id).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.value.toLowerCase());
        
        const matchesStatus = statusFilter.value === 'all' || order.status === statusFilter.value;
        
        return matchesSearch && matchesStatus;
    });
});

const stats = computed(() => {
    const total = orders.value.length;
    const pending = orders.value.filter(o => o.status === 'Pending').length;
    const processing = orders.value.filter(o => ['Baking', 'Ready'].includes(o.status)).length;
    const completed = orders.value.filter(o => o.status === 'Completed').length;
    const revenue = orders.value.reduce((acc, curr) => acc + (curr.status !== 'Cancelled' ? curr.total : 0), 0);
    
    return { total, pending, processing, completed, revenue };
});

const getStatusColor = (status: Order['status']) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'Baking': 
        case 'Ready': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
        case 'Pending':
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
};

const viewDetails = (order: Order) => {
    viewingOrder.value = order;
    isDetailOpen.value = true;
};

const changeStatus = async (order: Order, status: string) => {
    await updateOrderStatus(order.id, status as Order['status']);
};

const isCancelModalOpen = ref(false);
const selectedCancelReason = ref('');
const customReason = ref('');
const predefinedReasons = [
    'Customer requested cancellation',
    'Out of stock',
    'Kitchen too busy',
    'Delivery issues',
    'Payment failed',
    'Incorrect order details',
    'Other'
];

const openCancelModal = () => {
    isCancelModalOpen.value = true;
    selectedCancelReason.value = 'Customer requested cancellation';
};

const confirmCancel = async () => {
    const reason = selectedCancelReason.value === 'Other' ? customReason.value : selectedCancelReason.value;
    if (!reason) return;
    
    await updateOrderStatus(viewingOrder.value.id, 'Cancelled', undefined, reason);
    isCancelModalOpen.value = false;
};
</script>

<template>
    <div class="space-y-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-6 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-green-600">{{ t('orders.totalOrders') }}</p>
                    <p class="text-2xl font-bold text-green-900 mt-1">{{ stats.total }}</p>
                </div>
                <div class="p-3 bg-green-50 rounded-lg">
                    <Package class="w-6 h-6 text-green-600" />
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-green-600">{{ t('reports.totalRevenue') }}</p>
                    <p class="text-2xl font-bold text-green-900 mt-1">{{ formatPrice(stats.revenue) }}</p>
                </div>
                <div class="p-3 bg-green-50 rounded-lg">
                    <ArrowUpRight class="w-6 h-6 text-green-600" />
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                <div>
                     <p class="text-sm font-medium text-yellow-600">{{ t('orders.pending') }}</p>
                    <p class="text-2xl font-bold text-yellow-700 mt-1">{{ stats.pending }}</p>
                </div>
                 <div class="p-3 bg-yellow-50 rounded-lg">
                    <Clock class="w-6 h-6 text-yellow-600" />
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                 <div>
                    <p class="text-sm font-medium text-blue-600">{{ t('orders.processing') }}</p>
                    <p class="text-2xl font-bold text-blue-700 mt-1">{{ stats.processing }}</p>
                </div>
                 <div class="p-3 bg-blue-50 rounded-lg">
                    <Utensils class="w-6 h-6 text-blue-600" />
                </div>
            </div>
        </div>

        <!-- content -->
        <div class="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
            <!-- Toolbar -->
            <div class="p-4 border-b border-green-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-green-50/30">
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <div class="relative w-full md:w-64">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            v-model="searchQuery"
                            type="text" 
                            :placeholder="t('orders.searchPlaceholder')" 
                            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                    </div>
                </div>
                
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <Filter class="w-4 h-4 text-green-600" />
                    <select 
                        v-model="statusFilter"
                        class="text-sm border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    >
                        <option value="all">{{ t('orders.allStatus') }}</option>
                        <option value="Pending">{{ t('orders.pending') }}</option>
                        <option value="Baking">Baking</option>
                        <option value="Ready">Ready</option>
                        <option value="Completed">{{ t('nav.logout').replace('Logout', 'Completed') === 'Completed' ? 'Completed' : 'Completed' /* Using logical fallback if needed */ }}</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-green-50 text-green-900 font-medium">
                        <tr>
                            <th class="px-6 py-3">{{ t('orders.orderId') }}</th>
                            <th class="px-6 py-3">{{ t('orders.customer') }}</th>
                            <th class="px-6 py-3">{{ t('orders.date') }}</th>
                            <th class="px-6 py-3">{{ t('orders.items') }}</th>
                            <th class="px-6 py-3">{{ t('orders.total') }}</th>
                            <th class="px-6 py-3">Type</th>
                            <th class="px-6 py-3">{{ t('orders.status') }}</th>
                            <th class="px-6 py-3 text-right">{{ t('orders.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-if="filteredOrders.length === 0">
                             <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                                {{ t('orders.noOrdersFound') }}
                            </td>
                        </tr>
                        <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 font-medium text-gray-900">#{{ order.id }}</td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-900">{{ order.customerName }}</div>
                                <div class="text-xs text-gray-500">{{ order.customerEmail }}</div>
                            </td>
                            <td class="px-6 py-4 text-gray-600">{{ order.date }}</td>
                            <td class="px-6 py-4 text-gray-600">{{ order.items.length }} {{ t('orders.items').toLowerCase() }}</td>
                            <td class="px-6 py-4 font-medium text-gray-900">{{ formatPrice(order.total) }}</td>
                            <td class="px-6 py-4">
                                <span :class="`px-2 py-1 rounded-md text-[10px] font-black uppercase border transition-all ${order.deliveryType === 'Delivery' ? 'bg-bakery-900 text-white border-bakery-900 shadow-sm' : 'bg-bakery-100 text-bakery-950 border-bakery-200'}`">
                                    {{ order.deliveryType || 'Pick-up' }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span :class="`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} capitalize`">
                                    {{ order.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button @click="viewDetails(order)" class="text-gray-400 hover:text-green-600 transition-colors">
                                    <Eye class="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Order Detail Modal -->
        <div v-if="isDetailOpen && viewingOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div class="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <div class="flex items-center gap-3">
                             <h2 class="text-xl font-bold text-gray-900">{{ t('orders.orderDetails') }} #{{ viewingOrder.id }}</h2>
                             <span :class="`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewingOrder.status)} capitalize`">
                                {{ viewingOrder.status }}
                             </span>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">{{ t('orders.placedOn') }} {{ viewingOrder.date }}</p>
                    </div>
                    <button @click="isDetailOpen = false" class="text-gray-400 hover:text-gray-600"><XCircle class="w-6 h-6" /></button>
                </div>

                <div class="p-6 overflow-y-auto space-y-6">
                    <!-- Live Tracker Section -->
                    <div v-if="viewingOrder.deliveryType === 'Delivery'" class="animate-in fade-in slide-in-from-top-4 duration-700">
                        <DeliveryTracker :order-id="viewingOrder.id" :active="isDetailOpen" />
                    </div>
                    <!-- Workflow Actions -->
                    <div class="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span class="text-sm font-medium text-gray-700 flex items-center w-full sm:w-auto">{{ t('orders.updateStatus') }}:</span>
                        <div class="flex gap-2 flex-wrap">
                            <button 
                                v-if="viewingOrder.paymentStatus !== 'Paid'"
                                @click="updateOrderStatus(viewingOrder.id, undefined, 'Paid')"
                                class="px-3 py-1.5 bg-bakery-900 text-white text-sm font-medium rounded hover:bg-black border border-bakery-900 transition-colors flex items-center gap-2"
                            >
                                <CheckCircle2 class="w-4 h-4" />
                                Mark as Paid
                            </button>
                            <button 
                                v-if="viewingOrder.status === 'Pending'"
                                @click="changeStatus(viewingOrder, 'Baking')"
                                class="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 border border-blue-200 transition-colors"
                            >
                                {{ t('orders.startBaking') }}
                            </button>
                             <button 
                                v-if="viewingOrder.status === 'Baking'"
                                @click="changeStatus(viewingOrder, 'Ready')"
                                class="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200 border border-green-200 transition-colors"
                            >
                                {{ t('orders.markReady') }}
                            </button>
                             <button 
                                v-if="viewingOrder.status === 'Ready'"
                                @click="changeStatus(viewingOrder, 'Completed')"
                                class="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 border border-green-700 transition-colors"
                            >
                                {{ t('orders.markCompleted') }}
                            </button>
                            <button 
                                v-if="['Pending', 'Baking', 'Ready'].includes(viewingOrder.status)"
                                @click="openCancelModal"
                                class="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 border border-red-200 transition-colors"
                            >
                                {{ t('orders.cancelOrder') }}
                            </button>
                             <span v-if="viewingOrder.status === 'Completed'" class="text-sm text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle2 class="w-4 h-4" /> {{ t('orders.orderFulfilled') }}
                             </span>
                             <span v-if="viewingOrder.status === 'Cancelled'" class="text-sm text-red-600 font-medium flex items-center gap-1">
                                <XCircle class="w-4 h-4" /> {{ t('orders.orderCancelled') }}
                             </span>
                        </div>
                    </div>

                    <!-- Cancellation Reason -->
                    <div v-if="viewingOrder.status === 'Cancelled' && viewingOrder.cancel_reason" class="bg-red-50 border border-red-100 p-4 rounded-lg">
                        <div class="flex items-center gap-2 text-red-700 font-bold mb-1">
                            <XCircle class="w-4 h-4" />
                            <span>Cancellation Reason</span>
                        </div>
                        <p class="text-sm text-red-600">{{ viewingOrder.cancel_reason }}</p>
                    </div>

                    <!-- Customer Info -->
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">{{ t('orders.customerDetails') }}</h3>
                            <div class="bg-white rounded-lg border border-gray-100 p-3 space-y-1 text-sm">
                                <p><span class="text-gray-500 w-16 inline-block">{{ t('orders.name') }}:</span> <span class="font-medium">{{ viewingOrder.customerName }}</span></p>
                                <p><span class="text-gray-500 w-16 inline-block">{{ t('orders.email') }}:</span> <span>{{ viewingOrder.customerEmail }}</span></p>
                                <p><span class="text-gray-500 w-16 inline-block">{{ t('orders.phone') }}:</span> <span>{{ viewingOrder.phone || 'N/A' }}</span></p>
                                <p><span class="text-gray-500 w-16 inline-block">{{ t('orders.address') }}:</span> <span>{{ viewingOrder.address || 'N/A' }}</span></p>
                            </div>
                        </div>
                        <div>
                             <h3 class="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">{{ t('orders.orderTimeline') }}</h3>
                            <div class="bg-white rounded-lg border border-gray-100 p-3 space-y-1 text-sm">
                                <p><span class="text-gray-500 w-24 inline-block">Placed:</span> <span>{{ viewingOrder.date }} {{ viewingOrder.startTime ? '' : '(Pending)' }}</span></p>
                                <p><span class="text-gray-500 w-24 inline-block">Payment:</span> <span :class="viewingOrder.paymentStatus === 'Paid' ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'">{{ viewingOrder.paymentStatus || 'Unpaid' }}</span></p>
                                <p v-if="viewingOrder.paymentMethod"><span class="text-gray-500 w-24 inline-block">Method:</span> <span class="capitalize">{{ viewingOrder.paymentMethod }}</span></p>
                                <p v-if="viewingOrder.startTime"><span class="text-gray-500 w-24 inline-block">Started:</span> <span>{{ viewingOrder.startTime }}</span></p>
                                <p v-if="viewingOrder.completedTime"><span class="text-gray-500 w-24 inline-block">Completed:</span> <span>{{ viewingOrder.completedTime }}</span></p>
                            </div>
                        </div>
                     </div>

                    <!-- Items -->
                    <div>
                        <h3 class="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">{{ t('orders.orderItems') }}</h3>
                        <div class="border rounded-lg overflow-hidden border-gray-200">
                            <table class="w-full text-sm">
                                <thead class="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th class="px-4 py-2 text-left">{{ t('orders.product') }}</th>
                                        <th class="px-4 py-2 text-center">{{ t('orders.qty') }}</th>
                                        <th class="px-4 py-2 text-right">{{ t('orders.price') }}</th>
                                        <th class="px-4 py-2 text-right">{{ t('orders.subtotal') }}</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="(item, idx) in viewingOrder.items" :key="idx">
                                        <td class="px-4 py-2 font-medium text-gray-900">
                                            <div class="flex items-center gap-3">
                                                <img 
                                                    :src="item.productImage || 'https://placehold.co/100x100?text=No+Image'" 
                                                    :alt="item.productName"
                                                    class="w-10 h-10 rounded-md object-cover border border-gray-100"
                                                />
                                                <span>{{ item.productName }}</span>
                                            </div>
                                        </td>
                                        <td class="px-4 py-2 text-center text-gray-600">{{ item.quantity }}</td>
                                        <td class="px-4 py-2 text-right text-gray-600">{{ formatPrice(item.price) }}</td>
                                        <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatPrice(item.price * item.quantity) }}</td>
                                    </tr>
                                </tbody>
                                <tfoot class="bg-gray-50 font-bold text-gray-900">
                                    <tr>
                                        <td colspan="3" class="px-4 py-3 text-right">{{ t('orders.total') }}</td>
                                        <td class="px-4 py-3 text-right text-green-700 text-lg">{{ formatPrice(viewingOrder.total) }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    
                    <div v-if="viewingOrder.notes" class="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-sm text-yellow-800">
                        <span class="font-bold">{{ t('orders.notes') }}:</span> {{ viewingOrder.notes }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Cancel Reason Modal -->
        <div v-if="isCancelModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
                    <h3 class="text-lg font-bold text-red-900 flex items-center gap-2">
                        <XCircle class="w-5 h-5" /> Cancel Order #{{ viewingOrder.id }}
                    </h3>
                    <button @click="isCancelModalOpen = false" class="text-gray-400 hover:text-gray-600"><XCircle class="w-6 h-6" /></button>
                </div>
                
                <div class="p-6 space-y-4">
                    <p class="text-sm text-gray-600 font-medium">Please select a reason for cancelling this order:</p>
                    
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
                            placeholder="Enter detailed reason..."
                            class="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                            rows="3"
                        ></textarea>
                    </div>
                </div>

                <div class="p-6 bg-gray-50 flex gap-3">
                    <button 
                        @click="isCancelModalOpen = false"
                        class="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Keep Order
                    </button>
                    <button 
                        @click="confirmCancel"
                        :disabled="selectedCancelReason === 'Other' && !customReason.trim()"
                        class="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
                    >
                        Confirm Cancellation
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
