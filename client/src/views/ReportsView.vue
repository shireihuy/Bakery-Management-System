<script setup lang="ts">
import { ref } from 'vue';
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    ShoppingBag, 
    Users, 
    Download,
    Calendar,
    ArrowUpRight,
    ChevronRight,
    PieChart
} from 'lucide-vue-next';
import { useReports } from '../composables/useReports';

const { 
    dailyHistory, 
    productPerformance, 
    categoryDistribution,
    totalWeeklyRevenue,
    totalWeeklyOrders,
    averageOrderValue,
    maxDailyRevenue
} = useReports();

const selectedRange = ref('Last 7 Days');

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
};
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-green-900 flex items-center gap-3">
                    <BarChart3 class="w-7 h-7 text-green-600" />
                    Analytics & Reports
                </h2>
                <p class="text-sm text-green-600">Track your bakery's growth and performance</p>
            </div>
            <div class="flex items-center gap-3">
                <div class="relative bg-white border border-green-100 rounded-lg px-3 py-2 flex items-center gap-2 text-sm shadow-sm group hover:border-green-400 cursor-pointer transition-all">
                    <Calendar class="w-4 h-4 text-green-600" />
                    <span class="font-medium text-gray-700">{{ selectedRange }}</span>
                    <ChevronRight class="w-4 h-4 text-gray-400 transition-transform group-hover:rotate-90" />
                </div>
                <button class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold shadow-md">
                    <Download class="w-4 h-4" />
                    Export CSV
                </button>
            </div>
        </div>

        <!-- Summary Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gradient-to-br from-green-600 to-emerald-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                <div class="relative z-10">
                    <div class="p-2 bg-white/20 w-fit rounded-lg mb-4">
                        <DollarSign class="w-6 h-6" />
                    </div>
                    <p class="text-green-50/80 font-medium text-sm">Total Revenue (Weekly)</p>
                    <h3 class="text-3xl font-bold mt-1">{{ formatCurrency(totalWeeklyRevenue) }}</h3>
                    <div class="flex items-center gap-1 mt-4 text-sm font-medium bg-white/20 w-fit px-2 py-1 rounded-full">
                        <ArrowUpRight class="w-4 h-4" />
                        +12.5% from last week
                    </div>
                </div>
                <DollarSign class="absolute bottom-[-20px] right-[-20px] w-40 h-40 text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
            </div>

            <div class="bg-white p-6 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden group">
                <div class="p-2 bg-blue-50 w-fit rounded-lg mb-4 text-blue-600">
                    <ShoppingBag class="w-6 h-6" />
                </div>
                <p class="text-gray-500 font-medium text-sm">Total Orders</p>
                <h3 class="text-3xl font-bold mt-1 text-gray-900">{{ totalWeeklyOrders }}</h3>
                <div class="flex items-center gap-1 mt-4 text-sm font-medium text-green-600">
                    <TrendingUp class="w-4 h-4" />
                    +8.2% sales volume
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden group">
                <div class="p-2 bg-purple-50 w-fit rounded-lg mb-4 text-purple-600">
                    <Users class="w-6 h-6" />
                </div>
                <p class="text-gray-500 font-medium text-sm">Average Order Value</p>
                <h3 class="text-3xl font-bold mt-1 text-gray-900">{{ formatCurrency(averageOrderValue) }}</h3>
                <div class="flex items-center gap-1 mt-4 text-sm font-medium text-red-500">
                    <TrendingDown class="w-4 h-4" />
                    -2.1% from average
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Revenue Chart -->
            <div class="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <TrendingUp class="w-5 h-5 text-green-600" />
                        Revenue Over Time
                    </h3>
                    <span class="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Weekly Glance</span>
                </div>
                <div class="flex items-end justify-between h-64 px-4 pb-4 border-b border-gray-100 mb-8">
                    <div v-for="day in dailyHistory" :key="day.date" class="flex flex-col items-center gap-3 w-full group">
                        <div class="relative w-8 bg-green-50 rounded-t-lg group-hover:bg-green-100 transition-all duration-300 flex items-end justify-center overflow-hidden h-full">
                            <div 
                                class="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-lg transition-all duration-1000 origin-bottom"
                                :style="{ height: `${(day.revenue / maxDailyRevenue) * 100}%` }"
                            >
                                <div class="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/20 transition-opacity"></div>
                            </div>
                            <!-- Tooltip -->
                            <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {{ formatCurrency(day.revenue) }}
                            </div>
                        </div>
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-tighter">{{ day.date }}</span>
                    </div>
                </div>
            </div>

            <!-- Category Distribution -->
            <div class="bg-white p-6 rounded-2xl border border-green-100 shadow-sm flex flex-col">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <PieChart class="w-5 h-5 text-green-600" />
                        Category Distribution
                    </h3>
                </div>
                <div class="flex-1 flex items-center justify-around gap-8">
                    <!-- Simple Mock Pie Representation -->
                    <div class="relative w-48 h-48 rounded-full border-[16px] border-emerald-600 flex items-center justify-center">
                        <div class="absolute w-full h-full rounded-full border-[16px] border-green-400 border-l-transparent border-t-transparent rotate-45"></div>
                        <div class="absolute w-full h-full rounded-full border-[16px] border-blue-400 border-r-transparent border-t-transparent border-b-transparent -rotate-12"></div>
                        <div class="text-center">
                            <span class="text-3xl font-black text-emerald-700">45%</span>
                            <p class="text-[10px] font-bold text-gray-400 uppercase">Cakes</p>
                        </div>
                    </div>
                    <div class="space-y-4 flex-1 max-w-[200px]">
                        <div v-for="(cat, idx) in categoryDistribution" :key="cat.name" class="space-y-1">
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-gray-600">{{ cat.name }}</span>
                                <span class="text-gray-900">{{ cat.value }}%</span>
                            </div>
                            <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    class="h-full rounded-full"
                                    :class="idx === 0 ? 'bg-emerald-600' : idx === 1 ? 'bg-green-400' : idx === 2 ? 'bg-blue-400' : 'bg-gray-400'"
                                    :style="{ width: `${cat.value}%` }"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Best Selling Products Table -->
        <div class="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 class="font-bold text-gray-900 text-lg">Best Selling Products</h3>
                <button class="text-green-700 font-bold text-sm hover:underline">View Detailed Rankings</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-green-50/50 text-green-900 font-bold border-b border-green-100">
                        <tr>
                            <th class="px-6 py-4">Product Name</th>
                            <th class="px-6 py-4">Total Sales</th>
                            <th class="px-6 py-4">Total Revenue</th>
                            <th class="px-6 py-4">Current Trend</th>
                            <th class="px-6 py-4 text-right">Performance Score</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="product in productPerformance" :key="product.name" class="hover:bg-green-50/20 transition-colors group">
                            <td class="px-6 py-4 font-bold text-gray-900">{{ product.name }}</td>
                            <td class="px-6 py-4 text-gray-600">{{ product.sales }} units</td>
                            <td class="px-6 py-4 font-medium text-emerald-700">{{ formatCurrency(product.revenue) }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                                    <template v-if="product.trend === 'up'">
                                        <div class="p-1 bg-green-100 text-green-600 rounded-full"><TrendingUp class="w-3 h-3" /></div>
                                        <span class="text-green-600">Surging</span>
                                    </template>
                                    <template v-else-if="product.trend === 'down'">
                                        <div class="p-1 bg-red-100 text-red-600 rounded-full"><TrendingDown class="w-3 h-3" /></div>
                                        <span class="text-red-600">Slowing</span>
                                    </template>
                                    <template v-else>
                                        <div class="p-1 bg-gray-100 text-gray-400 rounded-full"><ChevronRight class="w-3 h-3" /></div>
                                        <span class="text-gray-400">Stable</span>
                                    </template>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-1">
                                    <div 
                                        v-for="i in 5" :key="i"
                                        :class="i <= (product.sales / 50) ? 'bg-green-500' : 'bg-gray-200'"
                                        class="w-4 h-1 rounded-full"
                                    ></div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes growUp {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
}
.origin-bottom {
    transform-origin: bottom;
    animation: growUp 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
