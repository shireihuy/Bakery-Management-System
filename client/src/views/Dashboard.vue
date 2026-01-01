<script setup lang="ts">
import { computed } from 'vue';
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

const { orders } = useOrders();
const { products } = useProducts();
const { lowStockItems: inventoryLowStock } = useInventory();

const stats = computed(() => [
  {
    title: "Total Revenue",
    value: `$${orders.value.reduce((sum, o) => sum + o.total, 0).toLocaleString()}`,
    change: `From ${orders.value.length} orders`,
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    title: "Active Orders",
    value: orders.value.filter(o => ['pending', 'processing'].includes(o.status)).length.toString(),
    change: "Waiting for action",
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    title: "Total Products",
    value: products.value.length.toString(),
    change: "Active catalog",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    title: "Low Stock Items",
    value: inventoryLowStock.value.length.toString(),
    change: "Requiring attention",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100"
  }
]);

const recentOrders = computed(() => {
    return [...orders.value].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 4);
});

const lowStockDisplay = computed(() => {
    return inventoryLowStock.value.slice(0, 3);
});
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Banner -->
    <div class="rounded-xl border bg-card text-card-foreground shadow overflow-hidden border-green-200 bg-gradient-to-r from-green-500 to-emerald-600">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <Sparkles class="w-5 h-5 text-white" />
              <h2 class="text-white font-semibold text-xl">Welcome to Your Bakery Dashboard</h2>
            </div>
            <p class="text-white/90 text-sm">Here's what's happening with your bakery today</p>
          </div>
          <div class="hidden md:block w-32 h-32 rounded-lg overflow-hidden border-2 border-white/20">
             <img
                src="https://images.unsplash.com/photo-1679673987713-54f809ce417d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyZWFkJTIwYmFrZXJ5fGVufDF8fHx8MTc2MTk3NzQ4MXww&ixlib=rb-4.1.0&q=80&w=400"
                alt="Fresh bakery"
                class="w-full h-full object-cover"
              />
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="(stat, index) in stats" 
        :key="index" 
        class="rounded-xl border bg-card text-card-foreground shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer border-green-200 bg-white"
      >
        <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="tracking-tight text-sm font-medium">{{ stat.title }}</h3>
          <div :class="`${stat.bgColor} p-2 rounded-lg`">
            <component :is="stat.icon" :class="`w-4 h-4 ${stat.color}`" />
          </div>
        </div>
        <div class="p-6 pt-0">
          <div class="text-2xl font-bold text-green-900">{{ stat.value }}</div>
          <p class="text-xs text-green-600 mt-1">{{ stat.change }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Orders -->
      <div class="rounded-xl border bg-card text-card-foreground shadow border-green-200 bg-white">
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="font-semibold leading-none tracking-tight">Recent Orders</h3>
        </div>
        <div class="p-6 pt-0">
          <div class="space-y-4">
            <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <p class="text-sm text-green-900 font-medium">{{ order.id }}</p>
                  <div 
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    :class="[
                        order.status === 'completed' 
                        ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80 bg-green-900 text-white' 
                        : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-green-200 text-green-800'
                    ]"
                  >
                    {{ order.status }}
                  </div>
                </div>
                <p class="text-sm text-green-600">{{ order.customerName }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-green-900 font-bold">${{ order.total.toFixed(2) }}</p>
                <p class="text-xs text-green-600">{{ order.items.length }} items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alerts -->
      <div class="rounded-xl border bg-card text-card-foreground shadow border-green-200 bg-white">
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="font-semibold leading-none tracking-tight flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-red-600" />
            Low Stock Alerts
          </h3>
        </div>
        <div class="p-6 pt-0">
          <div class="space-y-4">
            <div v-for="(item, index) in lowStockDisplay" :key="index" class="p-3 bg-red-50 rounded-lg border border-red-200">
              <div class="flex justify-between items-start mb-2">
                <p class="text-sm text-green-900 font-medium">{{ item.name }}</p>
                <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 bg-red-600 text-white">Low</div>
              </div>
              <div class="flex justify-between text-xs text-green-600">
                <span>Current: {{ item.quantity }} {{ item.unit }}</span>
                <span>Min: {{ item.minQuantity }} {{ item.unit }}</span>
              </div>
              <div class="mt-2 w-full bg-red-200 rounded-full h-2 overflow-hidden">
                <div 
                  class="bg-red-600 h-2 rounded-full" 
                  :style="{ width: `${(item.quantity / item.minQuantity) * 100}%` }"
                ></div>
              </div>
            </div>
            <div v-if="lowStockDisplay.length === 0" class="text-center py-4 text-green-600 text-sm italic">
                All inventory levels are healthy.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Best Selling Products (Simplified) -->
    <div class="rounded-xl border bg-card text-card-foreground shadow border-green-200 bg-white">
        <div class="flex flex-col space-y-1.5 p-6">
            <h3 class="font-semibold leading-none tracking-tight">Featured Products</h3>
        </div>
        <div class="p-6 pt-0">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="(product, idx) in products.slice(0, 3)" :key="product.id" class="flex-1 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-green-100">
                    <div class="h-32 relative overflow-hidden group">
                         <img
                            :src="product.image"
                            :alt="product.name"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        <div class="absolute top-2 right-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 bg-gradient-to-r from-green-600 to-emerald-600 text-white">{{ idx + 1 }}</div>
                    </div>
                     <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                        <h4 class="text-green-900 mb-2 font-medium">{{ product.name }}</h4>
                        <div class="flex justify-between text-sm text-green-700">
                            <span>${{ product.price.toFixed(2) }}</span>
                            <span class="font-bold">{{ product.category }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
