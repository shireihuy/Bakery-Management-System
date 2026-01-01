<script setup lang="ts">
import { ref, computed } from 'vue';
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

const { orders, updateOrderStatus } = useOrders();

const searchQuery = ref('');
const statusFilter = ref<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');
const viewingOrder = ref<Order | null>(null);
const isDetailOpen = ref(false);

const filteredOrders = computed(() => {
    return orders.value.filter(order => {
        const matchesSearch = 
            order.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.value.toLowerCase());
        
        const matchesStatus = statusFilter.value === 'all' || order.status === statusFilter.value;
        
        return matchesSearch && matchesStatus;
    });
});

const stats = computed(() => {
    const total = orders.value.length;
    const pending = orders.value.filter(o => o.status === 'pending').length;
    const processing = orders.value.filter(o => o.status === 'processing').length;
    const completed = orders.value.filter(o => o.status === 'completed').length;
    const revenue = orders.value.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.total : 0), 0);
    
    return { total, pending, processing, completed, revenue };
});

const getStatusColor = (status: Order['status']) => {
    switch (status) {
        case 'completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
};

const viewDetails = (order: Order) => {
    viewingOrder.value = order;
    isDetailOpen.value = true;
};

const changeStatus = (order: Order, status: string) => {
    updateOrderStatus(order.id, status as Order['status']);
};
</script>

<template>
    <div class="space-y-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-6 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-green-600">Total Orders</p>
                    <p class="text-2xl font-bold text-green-900 mt-1">{{ stats.total }}</p>
                </div>
                <div class="p-3 bg-green-50 rounded-lg">
                    <Package class="w-6 h-6 text-green-600" />
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-green-600">Total Revenue</p>
                    <p class="text-2xl font-bold text-green-900 mt-1">${{ stats.revenue.toFixed(2) }}</p>
                </div>
                <div class="p-3 bg-green-50 rounded-lg">
                    <ArrowUpRight class="w-6 h-6 text-green-600" />
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                <div>
                     <p class="text-sm font-medium text-yellow-600">Pending</p>
                    <p class="text-2xl font-bold text-yellow-700 mt-1">{{ stats.pending }}</p>
                </div>
                 <div class="p-3 bg-yellow-50 rounded-lg">
                    <Clock class="w-6 h-6 text-yellow-600" />
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                 <div>
                    <p class="text-sm font-medium text-blue-600">Processing</p>
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
                            placeholder="Search order ID or customer..." 
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
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-green-50 text-green-900 font-medium">
                        <tr>
                            <th class="px-6 py-3">Order ID</th>
                            <th class="px-6 py-3">Customer</th>
                            <th class="px-6 py-3">Date</th>
                            <th class="px-6 py-3">Items</th>
                            <th class="px-6 py-3">Total</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-if="filteredOrders.length === 0">
                             <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                                No orders found matching your criteria
                            </td>
                        </tr>
                        <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 font-medium text-gray-900">{{ order.id }}</td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-900">{{ order.customerName }}</div>
                                <div class="text-xs text-gray-500">{{ order.customerEmail }}</div>
                            </td>
                            <td class="px-6 py-4 text-gray-600">{{ order.date }}</td>
                             <td class="px-6 py-4 text-gray-600">{{ order.items.length }} items</td>
                            <td class="px-6 py-4 font-medium text-gray-900">${{ order.total.toFixed(2) }}</td>
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
                             <h2 class="text-xl font-bold text-gray-900">Order #{{ viewingOrder.id }}</h2>
                             <span :class="`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewingOrder.status)} capitalize`">
                                {{ viewingOrder.status }}
                             </span>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">Placed on {{ viewingOrder.date }}</p>
                    </div>
                    <button @click="isDetailOpen = false" class="text-gray-400 hover:text-gray-600"><XCircle class="w-6 h-6" /></button>
                </div>

                <div class="p-6 overflow-y-auto space-y-6">
                    <!-- Workflow Actions -->
                    <div class="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span class="text-sm font-medium text-gray-700 flex items-center w-full sm:w-auto">Update Status:</span>
                        <div class="flex gap-2 flex-wrap">
                            <button 
                                v-if="viewingOrder.status === 'pending'"
                                @click="changeStatus(viewingOrder, 'processing')"
                                class="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 border border-blue-200 transition-colors"
                            >
                                Start Processing
                            </button>
                             <button 
                                v-if="viewingOrder.status === 'processing'"
                                @click="changeStatus(viewingOrder, 'completed')"
                                class="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200 border border-green-200 transition-colors"
                            >
                                Mark Completed
                            </button>
                            <button 
                                v-if="['pending', 'processing'].includes(viewingOrder.status)"
                                @click="changeStatus(viewingOrder, 'cancelled')"
                                class="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 border border-red-200 transition-colors"
                            >
                                Cancel Order
                            </button>
                             <span v-if="viewingOrder.status === 'completed'" class="text-sm text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle2 class="w-4 h-4" /> Order Fulfilled
                             </span>
                             <span v-if="viewingOrder.status === 'cancelled'" class="text-sm text-red-600 font-medium flex items-center gap-1">
                                <XCircle class="w-4 h-4" /> Order Cancelled
                             </span>
                        </div>
                    </div>

                    <!-- Customer Info -->
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Customer Details</h3>
                            <div class="bg-white rounded-lg border border-gray-100 p-3 space-y-1 text-sm">
                                <p><span class="text-gray-500 w-16 inline-block">Name:</span> <span class="font-medium">{{ viewingOrder.customerName }}</span></p>
                                <p><span class="text-gray-500 w-16 inline-block">Email:</span> <span>{{ viewingOrder.customerEmail }}</span></p>
                                <p><span class="text-gray-500 w-16 inline-block">Phone:</span> <span>{{ viewingOrder.phone || 'N/A' }}</span></p>
                                <p><span class="text-gray-500 w-16 inline-block">Address:</span> <span>{{ viewingOrder.address || 'N/A' }}</span></p>
                            </div>
                        </div>
                        <div>
                             <h3 class="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Order Timeline</h3>
                            <div class="bg-white rounded-lg border border-gray-100 p-3 space-y-1 text-sm">
                                <p><span class="text-gray-500 w-24 inline-block">Placed:</span> <span>{{ viewingOrder.date }} {{ viewingOrder.startTime ? '' : '(Pending)' }}</span></p>
                                <p v-if="viewingOrder.startTime"><span class="text-gray-500 w-24 inline-block">Started:</span> <span>{{ viewingOrder.startTime }}</span></p>
                                <p v-if="viewingOrder.completedTime"><span class="text-gray-500 w-24 inline-block">Completed:</span> <span>{{ viewingOrder.completedTime }}</span></p>
                            </div>
                        </div>
                     </div>

                    <!-- Items -->
                    <div>
                        <h3 class="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Order Items</h3>
                        <div class="border rounded-lg overflow-hidden border-gray-200">
                            <table class="w-full text-sm">
                                <thead class="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th class="px-4 py-2 text-left">Product</th>
                                        <th class="px-4 py-2 text-center">Qty</th>
                                        <th class="px-4 py-2 text-right">Price</th>
                                        <th class="px-4 py-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="(item, idx) in viewingOrder.items" :key="idx">
                                        <td class="px-4 py-2 font-medium text-gray-900">{{ item.productName }}</td>
                                        <td class="px-4 py-2 text-center text-gray-600">{{ item.quantity }}</td>
                                        <td class="px-4 py-2 text-right text-gray-600">${{ item.price.toFixed(2) }}</td>
                                        <td class="px-4 py-2 text-right font-medium text-gray-900">${{ (item.price * item.quantity).toFixed(2) }}</td>
                                    </tr>
                                </tbody>
                                <tfoot class="bg-gray-50 font-bold text-gray-900">
                                    <tr>
                                        <td colspan="3" class="px-4 py-3 text-right">Total</td>
                                        <td class="px-4 py-3 text-right text-green-700 text-lg">${{ viewingOrder.total.toFixed(2) }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    
                    <div v-if="viewingOrder.notes" class="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-sm text-yellow-800">
                        <span class="font-bold">Notes:</span> {{ viewingOrder.notes }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
