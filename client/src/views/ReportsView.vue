<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
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
import { useCurrency } from '../composables/useCurrency';

const { 
    dailyHistory, 
    productPerformance, 
    categoryDistribution,
    totalWeeklyRevenue,
    totalWeeklyOrders,
    averageOrderValue,
    maxDailyRevenue,
    fetchReports
} = useReports();
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
const { formatPrice } = useCurrency();
const selectedRange = ref('7days');
const isOpen = ref(false);
const router = useRouter();

const selectRange = async (range: string) => {
    selectedRange.value = range;
    isOpen.value = false;
    await fetchReports(range);
};

const formatLabel = (label: string) => {
    if (selectedRange.value === 'all' && label.includes('/')) {
        const parts = label.split('/');
        const monthStr = parts[0];
        if (monthStr) {
            const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIndex = parseInt(monthStr, 10) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                const lang = localStorage.getItem('lang') || 'en';
                if (lang === 'vn') return `Thg ${monthStr}`;
                if (lang === 'jp') return `${monthStr}月`;
                return `${monthNamesEn[monthIndex]}`;
            }
        }
    }
    return label;
};

const formatCurrency = (value: number) => {
    return formatPrice(value);
};
const handleExport = () => {
    const rangeLabel = selectedRange.value === 'all' ? t('reports.allTime') : selectedRange.value === 'lastMonth' ? t('reports.lastMonth') : t('reports.last7Days');
    const revenueLabel = selectedRange.value === 'all' ? t('dashboard.totalRevenue') : selectedRange.value === 'lastMonth' ? t('reports.totalRevenueMonthly') : t('reports.totalRevenueWeekly');
    const ordersLabel = selectedRange.value === 'all' ? t('orders.totalOrders') : selectedRange.value === 'lastMonth' ? t('reports.totalMonthlyOrders') : t('reports.totalWeeklyOrders');
    const lang = localStorage.getItem('lang') || 'en';

    // Multi-language text map for CSV Export
    const csvTexts = {
        en: {
            title: "DATA REPORT - BAKERY MANAGEMENT SYSTEM",
            interval: "Report Interval",
            summary: "SUMMARY",
            avgOrderValue: "Average Order Value",
            dailyHistory: "DAILY REVENUE HISTORY",
            dailyCols: "Day,Revenue,Orders",
            prodPerf: "PRODUCT PERFORMANCE (BEST SELLERS)",
            prodCols: "Product Name,Total Sales,Total Revenue"
        },
        jp: {
            title: "データレポート - ベーカリー管理システム",
            interval: "レポート期間",
            summary: "概要",
            avgOrderValue: "平均注文金額",
            dailyHistory: "日次収益履歴",
            dailyCols: "日,収益,注文数",
            prodPerf: "商品パフォーマンス (売筋商品)",
            prodCols: "商品名,総販売数,総収益"
        },
        vn: {
            title: "BÁO CÁO DỮ LIỆU - HỆ THỐNG QUẢN LÝ TIỆM BÁNH",
            interval: "Khoảng thời gian báo cáo",
            summary: "TỔNG QUAN",
            avgOrderValue: "Giá trị đơn hàng trung bình",
            dailyHistory: "LỊCH SỬ DOANH THU HÀNG NGÀY",
            dailyCols: "Ngày,Doanh thu,Đơn hàng",
            prodPerf: "HIỆU SUẤT SẢN PHẨM (SẢN PHẨM BÁN CHẠY)",
            prodCols: "Tên sản phẩm,Tổng đã bán,Tổng doanh thu"
        }
    };

    const texts = csvTexts[lang as keyof typeof csvTexts] || csvTexts.en;

    // 1. Prepare Content for CSV with UTF-8 BOM to prevent Excel display issues
    let csvContent = `\uFEFF${texts.title}\n`;
    csvContent += `${texts.interval}: ${rangeLabel}\n\n`;
    
    // Summary Section
    csvContent += `${texts.summary}\n`;
    csvContent += `"${revenueLabel}",${totalWeeklyRevenue.value}\n`;
    csvContent += `"${ordersLabel}",${totalWeeklyOrders.value}\n`;
    csvContent += `"${texts.avgOrderValue}",${averageOrderValue.value.toFixed(2)}\n\n`;
    
    // Daily History Section
    csvContent += `${texts.dailyHistory}\n`;
    csvContent += `${texts.dailyCols}\n`;
    dailyHistory.value.forEach(day => {
        csvContent += `${day.date},${day.revenue},${day.orders}\n`;
    });
    csvContent += "\n";
    
    // Product Performance Section
    csvContent += `${texts.prodPerf}\n`;
    csvContent += `${texts.prodCols}\n`;
    productPerformance.value.forEach(p => {
        csvContent += `"${p.name}",${p.sales},${p.revenue}\n`;
    });
    
    // 2. Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bakery_Report_${selectedRange.value}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-green-900 flex items-center gap-3">
                    <BarChart3 class="w-7 h-7 text-green-600" />
                    {{ t('reports.analyticsReports') }}
                </h2>
                <p class="text-sm text-green-600">{{ t('reports.trackGrowth') }}</p>
            </div>
            <div class="flex items-center gap-3">
                <div class="relative">
                    <button 
                        @click="isOpen = !isOpen"
                        class="bg-white border border-green-100 rounded-lg px-3 py-2 flex items-center gap-2 text-sm shadow-sm group hover:border-green-400 cursor-pointer transition-all font-medium text-gray-700"
                    >
                        <Calendar class="w-4 h-4 text-green-600" />
                        <span>{{ selectedRange === 'all' ? t('reports.allTime') : selectedRange === 'lastMonth' ? t('reports.lastMonth') : t('reports.last7Days') }}</span>
                        <ChevronRight class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-90': isOpen }" />
                    </button>
                    <!-- Dropdown menu -->
                    <div v-if="isOpen" class="absolute right-0 mt-2 w-48 bg-white border border-green-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                        <button 
                            @click="selectRange('7days')"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center justify-between"
                            :class="{ 'bg-green-50/50 text-green-700 font-bold': selectedRange === '7days' }"
                        >
                            <span>{{ t('reports.last7Days') }}</span>
                            <span v-if="selectedRange === '7days'" class="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        </button>
                        <button 
                            @click="selectRange('lastMonth')"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center justify-between"
                            :class="{ 'bg-green-50/50 text-green-700 font-bold': selectedRange === 'lastMonth' }"
                        >
                            <span>{{ t('reports.lastMonth') }}</span>
                            <span v-if="selectedRange === 'lastMonth'" class="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        </button>
                        <button 
                            @click="selectRange('all')"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center justify-between"
                            :class="{ 'bg-green-50/50 text-green-700 font-bold': selectedRange === 'all' }"
                        >
                            <span>{{ t('reports.allTime') }}</span>
                            <span v-if="selectedRange === 'all'" class="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        </button>
                    </div>
                </div>
                <button 
                    @click="handleExport"
                    class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold shadow-md"
                >
                    <Download class="w-4 h-4" />
                    {{ t('reports.exportCsv') }}
                </button>
            </div>
        </div>

        <!-- Summary Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-linear-to-br from-green-600 to-emerald-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                <div class="relative z-10">
                    <div class="p-2 bg-white/20 w-fit rounded-lg mb-4">
                        <DollarSign class="w-6 h-6" />
                    </div>
                    <p class="text-green-50/80 font-medium text-sm">{{ selectedRange === 'all' ? t('dashboard.totalRevenue') : selectedRange === 'lastMonth' ? t('reports.totalRevenueMonthly') : t('reports.totalRevenueWeekly') }}</p>
                    <h3 class="text-3xl font-bold mt-1">{{ formatCurrency(totalWeeklyRevenue) }}</h3>
                    <div v-if="selectedRange !== 'all'" class="flex items-center gap-1 mt-4 text-sm font-medium bg-white/20 w-fit px-2 py-1 rounded-full">
                        <ArrowUpRight class="w-4 h-4" />
                        +12.5% {{ t('reports.fromLastWeek') }}
                    </div>
                </div>
                <DollarSign class="absolute bottom-[-20px] right-[-20px] w-40 h-40 text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
            </div>

            <div class="bg-white p-6 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden group">
                <div class="p-2 bg-blue-50 w-fit rounded-lg mb-4 text-blue-600">
                    <ShoppingBag class="w-6 h-6" />
                </div>
                <p class="text-gray-500 font-medium text-sm">{{ selectedRange === 'all' ? t('orders.totalOrders') : selectedRange === 'lastMonth' ? t('reports.totalMonthlyOrders') : t('reports.totalWeeklyOrders') }}</p>
                <h3 class="text-3xl font-bold mt-1 text-gray-900">{{ totalWeeklyOrders }}</h3>
                <div v-if="selectedRange !== 'all'" class="flex items-center gap-1 mt-4 text-sm font-medium text-green-600">
                    <TrendingUp class="w-4 h-4" />
                    +8.2% {{ t('reports.salesVolume') }}
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden group">
                <div class="p-2 bg-purple-50 w-fit rounded-lg mb-4 text-purple-600">
                    <Users class="w-6 h-6" />
                </div>
                <p class="text-gray-500 font-medium text-sm">{{ t('reports.averageOrderValue') }}</p>
                <h3 class="text-3xl font-bold mt-1 text-gray-900">{{ formatCurrency(averageOrderValue) }}</h3>
                <div v-if="selectedRange !== 'all'" class="flex items-center gap-1 mt-4 text-sm font-medium text-red-500">
                    <TrendingDown class="w-4 h-4" />
                    -2.1% {{ t('reports.fromAverage') }}
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
                        {{ t('reports.revenueOverTime') }}
                    </h3>
                    <span class="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {{ selectedRange === 'all' ? t('reports.allTime') : selectedRange === 'lastMonth' ? t('reports.lastMonth') : t('reports.sevenDayAnalytics') }}
                    </span>
                </div>
                <div class="h-64 mb-8">
                    <svg class="w-full h-full" viewBox="0 0 400 230" preserveAspectRatio="none">
                        <!-- Background Grid Lines -->
                        <line x1="0" y1="20" x2="400" y2="20" stroke="#f3f4f6" stroke-width="1" />
                        <line x1="0" y1="65" x2="400" y2="65" stroke="#f3f4f6" stroke-width="1" />
                        <line x1="0" y1="110" x2="400" y2="110" stroke="#f3f4f6" stroke-width="1" />
                        <line x1="0" y1="155" x2="400" y2="155" stroke="#f3f4f6" stroke-width="1" />
                        <line x1="0" y1="200" x2="400" y2="200" stroke="#f3f4f6" stroke-width="2" />
                        
                        <!-- Data Bars -->
                        <g v-for="(day, index) in dailyHistory" :key="index">
                            <!-- Revenue Number on Top -->
                            <text
                                v-if="dailyHistory.length <= 12"
                                :x="(index * (400 / dailyHistory.length)) + (400 / dailyHistory.length / 2)"
                                :y="200 - (maxDailyRevenue > 0 ? (day.revenue / maxDailyRevenue) * 170 : 0) - 8"
                                text-anchor="middle"
                                class="text-[8px] font-black fill-emerald-800"
                                style="font-size: 8px;"
                            >
                                {{ formatPrice(day.revenue).replace('.00', '') }}
                            </text>

                            <!-- The Bar -->
                            <rect
                                :x=" (index * (400 / dailyHistory.length)) + (400 / dailyHistory.length / 4)"
                                :y="200 - (maxDailyRevenue > 0 ? (day.revenue / maxDailyRevenue) * 170 : 0)"
                                :width="400 / dailyHistory.length / 2"
                                :height="maxDailyRevenue > 0 ? (day.revenue / maxDailyRevenue) * 170 : 0"
                                rx="6"
                                class="fill-current text-green-600 hover:text-emerald-500 transition-all duration-300 cursor-pointer"
                            >
                                <title>{{ formatLabel(day.date) }}: {{ formatCurrency(day.revenue) }}</title>
                            </rect>

                            <!-- Day Label Below -->
                            <text
                                v-if="dailyHistory.length <= 12 || index % Math.ceil(dailyHistory.length / 10) === 0"
                                :x="(index * (400 / dailyHistory.length)) + (400 / dailyHistory.length / 2)"
                                y="220"
                                text-anchor="middle"
                                class="text-[10px] font-black fill-gray-400 uppercase tracking-tighter"
                                style="font-size: 10px;"
                            >
                                {{ formatLabel(day.date) }}
                            </text>
                        </g>
                    </svg>
                </div>
            </div>

            <!-- Category Distribution -->
            <div class="bg-white p-6 rounded-2xl border border-green-100 shadow-sm flex flex-col">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <PieChart class="w-5 h-5 text-green-600" />
                        {{ t('reports.categoryDistribution') }}
                    </h3>
                </div>
                <div class="flex-1 flex items-center justify-around gap-8">
                    <!-- Simple Mock Pie Representation -->
                    <div class="relative w-48 h-48 rounded-full border-16 border-emerald-600 flex items-center justify-center">
                        <div class="absolute w-full h-full rounded-full border-16 border-green-400 border-l-transparent border-t-transparent rotate-45"></div>
                        <div class="absolute w-full h-full rounded-full border-16 border-blue-400 border-r-transparent border-t-transparent border-b-transparent -rotate-12"></div>
                        <div class="text-center">
                            <span class="text-3xl font-black text-emerald-700">
                                {{ categoryDistribution[0]?.value ?? 0 }}%
                            </span>
                            <p class="text-[10px] font-bold text-gray-400 uppercase">{{ t('products.category') }}</p>
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
                <h3 class="font-bold text-gray-900 text-lg">{{ t('reports.bestSellingProducts') }}</h3>
                <button @click="router.push({ name: 'orders' })" class="text-green-700 font-bold text-sm hover:underline">{{ t('reports.viewAllProducts') }}</button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                <div v-for="product in productPerformance" :key="product.name" class="bg-white border border-green-100 rounded-xl p-5 hover:shadow-md transition-shadow group">
                    <h4 class="font-bold text-gray-900 mb-3 truncate group-hover:text-green-700 transition-colors" :title="product.name">{{ product.name }}</h4>
                    <div class="space-y-3 mb-5">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-500">{{ t('reports.totalSales') }}</span>
                            <span class="font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md">{{ product.sales }}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-500">{{ t('reports.totalRevenue') }}</span>
                            <span class="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{{ formatCurrency(product.revenue) }}</span>
                        </div>
                    </div>
                    <div class="pt-4 border-t border-gray-50">
                        <!-- Plain language status and short explanation -->
                        <div v-if="product.trend === 'up'" class="flex items-start gap-2.5">
                            <div class="mt-0.5 p-1.5 bg-green-100 text-green-600 rounded-full"><TrendingUp class="w-3.5 h-3.5" /></div>
                            <div>
                                <p class="text-sm font-bold text-green-700">{{ t('reports.topSeller') }}</p>
                                <p class="text-xs text-gray-500 leading-tight mt-0.5">{{ t('reports.topSellerDesc') }}</p>
                            </div>
                        </div>
                        <div v-else-if="product.trend === 'down'" class="flex items-start gap-2.5">
                            <div class="mt-0.5 p-1.5 bg-red-100 text-red-600 rounded-full"><TrendingDown class="w-3.5 h-3.5" /></div>
                            <div>
                                <p class="text-sm font-bold text-red-700">{{ t('reports.needsAttention') }}</p>
                                <p class="text-xs text-gray-500 leading-tight mt-0.5">{{ t('reports.needsAttentionDesc') }}</p>
                            </div>
                        </div>
                        <div v-else class="flex items-start gap-2.5">
                            <div class="mt-0.5 p-1.5 bg-blue-100 text-blue-600 rounded-full"><ChevronRight class="w-3.5 h-3.5" /></div>
                            <div>
                                <p class="text-sm font-bold text-blue-700">{{ t('reports.steadySeller') }}</p>
                                <p class="text-xs text-gray-500 leading-tight mt-0.5">{{ t('reports.steadySellerDesc') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
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
