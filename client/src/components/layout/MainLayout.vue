<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  Package, 
  User, 
  Settings as SettingsIcon, 
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Warehouse,
  BarChart3,
  Bell,
  Users
} from 'lucide-vue-next';

import { useAuth } from '../../composables/useAuth';
import { useNotifications } from '../../composables/useNotifications';

const router = useRouter();
const route = useRoute();
const { user, logout: authLogout, autoLogin } = useAuth();
const notificationStore = useNotifications();
const { unreadCount, markAsRead, markAllAsRead } = notificationStore;
const notifications = computed(() => notificationStore.notifications.value);

const isNotificationOpen = ref(false);

// Initialize auth
// autoLogin(); // Now handled in App.vue for global availability

const navigation = computed(() => {
  const tabs = [];
  // Fallback to empty role if user is null
  const role = user.value?.role || '';
  
  if (['admin', 'manager'].includes(role)) {
    tabs.push({ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard });
  }
  if (['admin', 'manager', 'cashier'].includes(role)) {
    tabs.push({ name: 'Products', href: '/products', icon: Package });
  }
  if (['admin', 'manager', 'cashier', 'baker'].includes(role)) {
    tabs.push({ name: 'Orders', href: '/orders', icon: ShoppingCart });
  }
  if (['admin', 'manager', 'baker'].includes(role)) {
    tabs.push({ name: 'Inventory', href: '/inventory', icon: Warehouse });
  }
  if (['admin', 'manager'].includes(role)) {
    tabs.push({ name: 'Reports', href: '/reports', icon: BarChart3 });
  }
  if (role === 'admin') {
    tabs.push({ name: 'Users', href: '/users', icon: Users });
  }
  
  // Static tabs for everyone (including guests)
  if (!role || role === 'customer') {
    tabs.push({ name: 'Customer Menu', href: '/customer', icon: ShoppingCart });
  }
  
  return tabs;
});

const logout = () => {
  authLogout();
  router.push('/login');
};

const isActive = (path: string) => route.path === path;

const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getNotifIconColor = (type: string) => {
    switch (type) {
        case 'success': return 'text-green-500 bg-green-50';
        case 'warning': return 'text-orange-500 bg-orange-50';
        case 'error': return 'text-red-500 bg-red-50';
        default: return 'text-blue-500 bg-blue-50';
    }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header class="bg-white border-b border-green-200 shadow-sm">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div class="w-10 h-10 rounded-lg overflow-hidden border border-green-200 shadow-sm">
                <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
              </div>
              <div>
                <h1 class="text-green-900 font-bold">Matcha Bakery Management</h1>
                <p class="text-sm text-green-600">Manage your bakery operations efficiently</p>
              </div>
            </router-link>
            <div class="flex items-center gap-3">
              <!-- Notifications Popover (Hidden for guests) -->
              <div v-if="user" class="relative">
                <button 
                  @click="isNotificationOpen = !isNotificationOpen"
                  class="relative p-2 rounded-full hover:bg-green-50 text-green-700 transition-colors"
                  title="Notifications"
                >
                  <Bell class="w-5 h-5" />
                  <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                    {{ unreadCount }}
                  </span>
                </button>

                <!-- Dropdown -->
                <div 
                  v-if="isNotificationOpen" 
                  class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-green-100 z-50 overflow-hidden"
                >
                  <div class="p-4 border-b border-green-50 flex justify-between items-center bg-green-50/30">
                    <h3 class="font-bold text-green-900">Notifications</h3>
                    <button 
                      @click="markAllAsRead" 
                      class="text-xs text-green-600 hover:text-green-800 font-medium"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div class="max-h-96 overflow-y-auto">
                    <div v-if="notifications.length === 0" class="p-8 text-center text-gray-400">
                      No notifications yet
                    </div>
                    <div 
                      v-for="notif in notifications" 
                      :key="notif.id"
                      @click="markAsRead(notif.id)"
                      class="p-4 border-b border-gray-50 hover:bg-green-50/30 cursor-pointer transition-colors"
                      :class="{ 'bg-blue-50/20': !notif.isRead }"
                    >
                      <div class="flex gap-3">
                        <div :class="`p-2 rounded-lg h-fit ${getNotifIconColor(notif.type)}`">
                          <Bell class="w-4 h-4" />
                        </div>
                        <div class="flex-1">
                          <div class="flex justify-between items-start mb-1">
                            <span class="text-sm font-bold text-gray-900">{{ notif.title }}</span>
                            <span class="text-[10px] text-gray-400">{{ formatTime(notif.timestamp) }}</span>
                          </div>
                          <p class="text-xs text-gray-600 leading-relaxed">{{ notif.message }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="p-3 text-center bg-gray-50 font-medium">
                    <router-link to="/notifications" class="text-xs text-green-700 hover:underline" @click="isNotificationOpen = false">
                      View all notifications
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Click outside to close (Hidden for guests) -->
              <div v-if="user && isNotificationOpen" @click="isNotificationOpen = false" class="fixed inset-0 z-40"></div>

              <template v-if="user">
                <div class="flex items-center gap-2 px-3 py-1 bg-green-50/50 rounded-lg border border-green-100">
                  <User class="w-4 h-4 text-green-600" />
                  <span class="text-sm text-green-900 font-medium">{{ user.name }}</span>
                  <span class="capitalize inline-flex items-center rounded-full border border-green-200 px-2.5 py-0.5 text-[10px] font-bold transition-colors bg-white text-green-700">{{ user.role }}</span>
                </div>
                <button 
                  @click="router.push('/settings')"
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:text-accent-foreground h-9 px-3 border-green-200 hover:bg-green-50 bg-transparent text-green-900"
                >
                  <SettingsIcon class="w-4 h-4 mr-2" />
                  Settings
                </button>
                <button 
                  @click="logout"
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:text-accent-foreground h-9 px-3 border-green-200 hover:bg-green-50 bg-transparent text-green-900"
                >
                  <LogOut class="w-4 h-4 mr-2" />
                  Logout
                </button>
              </template>
              <template v-else>
                <button 
                  @click="router.push('/login')"
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm transition-all"
                >
                  <User class="w-4 h-4 mr-2" />
                  Login
                </button>
              </template>
            </div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-6 py-8">
        <!-- Navigation Tabs -->
        <div class="space-y-6">
            <div class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground bg-white/50 border border-green-100">
                <router-link
                    v-for="item in navigation"
                    :key="item.name"
                    :to="item.href"
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2"
                    :class="[isActive(item.href) ? 'bg-white text-green-900 shadow-sm' : 'text-green-600 hover:text-green-800']"
                >
                    <component :is="item.icon" class="w-4 h-4" />
                    <span class="hidden sm:inline">{{ item.name }}</span>
                </router-link>
            </div>

            <!-- Content Area -->
            <router-view></router-view>
        </div>
      </main>
    </div>
</template>
