<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-vue-next';
import { useOrders } from '../composables/useOrders';
import { useProducts } from '../composables/useProducts';
import { useInventory } from '../composables/useInventory';
import { useI18n } from '../composables/useI18n';
import { useCurrency } from '../composables/useCurrency';

const { orders, fetchOrders } = useOrders();
const { products, fetchProducts } = useProducts();
const { inventory: inventoryItems, lowStockItems: inventoryLowStock, fetchInventory } = useInventory();
const { t } = useI18n();
const { formatPrice } = useCurrency();
const router = useRouter();

onMounted(async () => {
    try {
        await Promise.all([
            fetchOrders(),
            fetchProducts(),
            fetchInventory()
        ]);
    } catch (err) {
        console.error('Error loading dashboard data:', err);
    }
});

const goToOrders = () => router.push({ name: 'orders' });
const goToInventory = () => router.push({ name: 'inventory' });
const goToReports = () => router.push({ name: 'reports' });

const stockSnapshotItems = computed(() => inventoryItems.value.slice(0, 4));

const stats = computed(() => [
  {
    title: t('dashboard.totalRevenue'),
    value: formatPrice(orders.value.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0)),
    change: `${orders.value.length} orders total`,
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    title: t('dashboard.activeOrders'),
    value: orders.value.filter(o => ['Pending', 'Ready'].includes(o.status)).length.toString(),
    change: 'Waiting for processing',
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    title: t('dashboard.totalProducts'),
    value: products.value.length.toString(),
    change: 'Products currently listed',
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    title: t('dashboard.lowStockItems'),
    value: inventoryLowStock.value.length.toString(),
    change: 'Need a refill soon',
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100"
  }
]);

const recentOrders = computed(() => {
    return [...orders.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
});

</script>

<template>
  <div class="space-y-8 p-1 sm:p-2 bg-accent-cream">
    <!-- Sophisticated Welcome Banner -->
    <div class="relative rounded-3xl overflow-hidden shadow-2xl premium-shadow group">
      <div class="absolute inset-0 bg-linear-to-r from-bakery-900 to-bakery-700 opacity-90 group-hover:scale-105 transition-transform duration-1000"></div>
      <div class="absolute top-0 right-0 w-1/3 h-full overflow-hidden opacity-30">
          <img
            src="https://images.unsplash.com/photo-1679673987713-54f809ce417d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyZWFkJTIwYmFrZXJ5fGVufDF8fHx8MTc2MTk3NzQ4MXww&ixlib=rb-4.1.0&q=80&w=600"
            alt="Fresh bakery"
            class="w-full h-full object-cover"
          />
      </div>
      <div class="relative p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div class="text-center sm:text-left space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bakery-500/20 border border-white/20 backdrop-blur-md">
              <Sparkles class="w-4 h-4 text-bakery-200" />
              <span class="text-xs font-bold text-bakery-100 uppercase tracking-widest">{{ t('dashboard.managementSuite') }}</span>
            </div>
            <h2 class="text-4xl sm:text-5xl font-black text-white leading-tight">{{ t('dashboard.artisanInsights') }}</h2>
            <p class="text-bakery-100/80 text-lg max-w-md font-medium">{{ t('dashboard.heroSubtitle') }}</p>
          </div>
          
          <div class="flex items-center gap-6">
              <div class="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-center min-w-[120px]">
                  <p class="text-bakery-200 text-xs font-bold uppercase tracking-widest mb-1">{{ t('dashboard.status') }}</p>
                  <p class="text-white font-black text-xl">{{ t('dashboard.active') }}</p>
              </div>
          </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button @click="goToOrders" class="glass-card rounded-[1.75rem] border border-bakery-100 p-5 text-left hover:border-bakery-300 transition-all">
        <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400">{{ t('dashboard.quickAction') }}</p>
        <p class="mt-2 text-lg font-black text-bakery-900">{{ t('dashboard.activeOrders') }}</p>
        <p class="mt-1 text-sm text-bakery-500">{{ t('dashboard.openOrdersDesc') }}</p>
      </button>
      <button @click="goToInventory" class="glass-card rounded-[1.75rem] border border-bakery-100 p-5 text-left hover:border-bakery-300 transition-all">
        <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400">{{ t('dashboard.quickAction') }}</p>
        <p class="mt-2 text-lg font-black text-bakery-900">{{ t('dashboard.checkInventory') }}</p>
        <p class="mt-1 text-sm text-bakery-500">{{ t('dashboard.checkInventoryDesc') }}</p>
      </button>
      <button @click="goToReports" class="glass-card rounded-[1.75rem] border border-bakery-100 p-5 text-left hover:border-bakery-300 transition-all">
        <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400">{{ t('dashboard.quickAction') }}</p>
        <p class="mt-2 text-lg font-black text-bakery-900">{{ t('dashboard.viewReports') }}</p>
        <p class="mt-1 text-sm text-bakery-500">{{ t('dashboard.viewReportsDesc') }}</p>
      </button>
    </div>

    <!-- Executive Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div 
        v-for="(stat, index) in stats" 
        :key="index" 
        class="glass-card p-8 rounded-[2.5rem] hover:scale-105 transition-all duration-500 group animate-in zoom-in"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <div class="flex items-start justify-between mb-6">
          <div :class="`p-4 rounded-2xl ${stat.bgColor.replace('bg-', 'bg-bakery-').replace('100', '50')} transition-colors`">
            <component :is="stat.icon" :class="`w-6 h-6 ${stat.color.replace('text-', 'text-bakery-').replace('600', '600')}`" />
          </div>
          <span class="text-[10px] font-black text-bakery-400 uppercase tracking-widest">{{ stat.change }}</span>
        </div>
        <div>
          <h3 class="text-bakery-500 text-sm font-bold uppercase tracking-widest mb-2">{{ stat.title }}</h3>
          <p class="text-3xl font-black text-bakery-900 group-hover:text-bakery-600 transition-colors">{{ stat.value }}</p>
        </div>
      </div>
    </div>


    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Orders with Live Status -->
      <div class="glass-card rounded-[2.5rem] border border-bakery-100 overflow-hidden">
        <div class="p-8 border-b border-bakery-50 flex items-center justify-between">
          <h3 class="font-black text-bakery-900 text-xl tracking-tight">{{ t('dashboard.activeOrders') }}</h3>
          <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-bakery-500 animate-pulse"></div>
              <span class="text-[10px] font-black text-bakery-400 uppercase tracking-widest">{{ t('dashboard.liveUpdates') }}</span>
          </div>
        </div>
        <div class="p-8 space-y-4">
            <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between p-5 bg-bakery-50/50 rounded-3xl border border-bakery-50 hover:border-bakery-200 transition-all group">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                  <p class="text-sm text-bakery-900 font-black">#{{ order.id }}</p>
                  <div 
                    class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                    :class="[
                        order.status === 'Completed' 
                        ? 'bg-bakery-900 text-white border-bakery-900' 
                        : 'bg-white text-bakery-600 border-bakery-100 group-hover:bg-bakery-600 group-hover:text-white group-hover:border-bakery-600 transition-all'
                    ]"
                  >
                    {{ order.status }}
                  </div>
                </div>
                <p class="text-sm text-bakery-500 font-medium">{{ order.customerName }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-black text-bakery-900">{{ formatPrice(order.total) }}</p>
                <p class="text-[10px] text-bakery-400 font-bold uppercase tracking-widest">{{ order.items.length }} {{ t('dashboard.items') }}</p>
              </div>
            </div>
        </div>
      </div>

      <!-- Current Stock Snapshot -->
      <div class="glass-card rounded-[2.5rem] border border-bakery-100 overflow-hidden">
        <div class="p-8 border-b border-bakery-50">
          <h3 class="font-black text-bakery-900 text-xl tracking-tight flex items-center gap-3">
            <Package class="w-6 h-6 text-bakery-500" />
            {{ t('dashboard.currentStockSnapshot') }}
          </h3>
        </div>
        <div class="p-8 space-y-6">
            <div v-for="(item, index) in stockSnapshotItems" :key="index" class="p-6 bg-white rounded-3xl border border-bakery-100 group shadow-sm">
              <div class="flex justify-between items-start mb-4">
                <div>
                    <p class="text-bakery-900 font-black">{{ item.name }}</p>
                    <p class="text-xs text-bakery-500 font-bold uppercase tracking-widest mt-1">{{ t('dashboard.currentStock') }}</p>
                </div>
                <div class="px-3 py-1 rounded-full bg-bakery-900 text-white text-[10px] font-black uppercase tracking-widest">{{ t('dashboard.snapshot') }}</div>
              </div>
              <div class="space-y-3">
                  <div class="flex justify-between text-xs font-bold text-bakery-500">
                    <span>{{ item.activeQuantity ?? 0 }} {{ (t('dashboard.activeTotal').split('/')[0] || '').trim() }} / {{ item.totalQuantity ?? 0 }} {{ (t('dashboard.activeTotal').split('/')[1] || '').trim() }} {{ item.unit }}</span>
                    <span>{{ (item.totalQuantity ?? 0) > 0 ? Math.round(((item.activeQuantity ?? 0) / (item.totalQuantity ?? 0)) * 100) : 0 }}%</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-3 p-0.5">
                    <div 
                      class="bg-emerald-600 h-2 rounded-full shadow-sm shadow-emerald-200 transition-all duration-1000" 
                      :style="{ width: `${(item.totalQuantity ?? 0) > 0 ? Math.min(100, ((item.activeQuantity ?? 0) / (item.totalQuantity ?? 0)) * 100) : 0}%` }"
                    ></div>
                  </div>
                  <p class="text-[11px] text-bakery-400 font-medium">
                    {{ item.hasExpiredBatch ? t('dashboard.expiredStockExists') : t('dashboard.noExpiredStock') }}
                  </p>
              </div>
            </div>
            <div v-if="stockSnapshotItems.length === 0" class="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div class="w-16 h-16 rounded-full bg-bakery-50 flex items-center justify-center">
                    <sparkles class="w-8 h-8 text-bakery-300" />
                </div>
                <p class="text-bakery-500 font-medium tracking-tight">{{ t('dashboard.inventoryOptimal') }}</p>
            </div>
        </div>
      </div>
    </div>

    <!-- Featured Products Modern Display -->
    <div class="glass-card rounded-[2.5rem] border border-bakery-100 overflow-hidden">
        <div class="p-8 border-b border-bakery-50">
            <h3 class="font-black text-bakery-900 text-xl tracking-tight">{{ t('dashboard.signatureCatalog') }}</h3>
        </div>
        <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div v-for="(product, idx) in products.slice(0, 4)" :key="product.id" class="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                    <div class="h-48 relative overflow-hidden">
                         <img
                            :src="product.image"
                            :alt="product.name"
                            class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                            />
                        <div class="absolute inset-0 bg-linear-to-t from-bakery-900/80 to-transparent p-6 flex flex-col justify-end">
                            <span class="text-[10px] font-black text-bakery-200 uppercase tracking-widest mb-1">{{ product.category }}</span>
                            <h4 class="text-white font-bold">{{ product.name }}</h4>
                        </div>
                        <div class="absolute top-4 left-4 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs font-black">#{{ idx + 1 }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>
