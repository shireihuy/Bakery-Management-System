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
const { user, logout: authLogout } = useAuth();
const notificationStore = useNotifications();
const { unreadCount, markAsRead, markAllAsRead } = notificationStore;
const notifications = computed(() => notificationStore.notifications.value);

const isNotificationOpen = ref(false);

// Initialize auth
// autoLogin(); // Now handled in App.vue for global availability

const navigation = computed(() => {
  const tabs = [];
  // Fallback to empty role if user is null
  const role = user.value?.role?.toLowerCase() || '';
  
  if (['admin', 'manager', 'cashier', 'baker'].includes(role)) {
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
  if (!role || role === 'customer' || role === 'cashier') {
    tabs.push({ name: 'Shop', href: '/customer', icon: ShoppingCart });
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
  <div class="min-h-screen bg-accent-cream dark:bg-bakery-950 transition-colors duration-500">
      <header class="glass-header sticky top-0 z-30">
        <div class="container mx-auto px-4 sm:px-6 py-4">
          <div class="flex items-center justify-between gap-4">
            <router-link to="/" class="flex items-center gap-3 group no-transition-all min-w-0">
              <div class="w-10 h-10 rounded-xl overflow-hidden border-2 border-bakery-200 dark:border-bakery-800 shadow-md transform group-hover:rotate-6 transition-transform duration-500 flex-shrink-0">
                <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0">
                <h1 class="text-base sm:text-lg font-black text-bakery-900 dark:text-white truncate tracking-tight">Matcha Bakery</h1>
                <p class="text-[10px] text-bakery-500 dark:text-bakery-400 uppercase tracking-widest font-black opacity-70 truncate">Management Portal</p>
              </div>
            </router-link>
            
            <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <!-- Notifications Popover -->
              <div v-if="user" class="relative">
                <button 
                  @click="isNotificationOpen = !isNotificationOpen"
                  class="relative p-2.5 rounded-xl bg-bakery-50/50 dark:bg-bakery-900/50 hover:bg-bakery-100 dark:hover:bg-bakery-800 text-bakery-600 dark:text-bakery-400 border border-bakery-100 dark:border-bakery-800 transition-all"
                >
                  <Bell class="w-5 h-5" />
                  <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger-text text-[10px] font-black text-white shadow-lg border-2 border-white dark:border-bakery-900 animate-pulse">
                    {{ unreadCount }}
                  </span>
                </button>

                <!-- Dropdown -->
                <div 
                  v-if="isNotificationOpen" 
                  class="absolute right-0 mt-4 w-[calc(100vw-2rem)] sm:w-96 glass-card rounded-3xl shadow-2xl overflow-hidden z-[60] border border-bakery-100 dark:border-bakery-800 animate-in slide-in-from-top duration-300"
                >
                  <div class="p-6 border-b border-bakery-50 dark:border-bakery-900 flex justify-between items-center bg-bakery-50/50 dark:bg-bakery-900/50">
                    <h3 class="font-black text-bakery-900 dark:text-white">Notifications</h3>
                    <button 
                      @click="markAllAsRead" 
                      class="text-[10px] font-black uppercase tracking-widest text-bakery-500 hover:text-bakery-900 dark:hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div class="max-h-[32rem] overflow-y-auto scrollbar-hide">
                    <div v-if="notifications.length === 0" class="p-12 text-center space-y-4">
                      <div class="w-16 h-16 rounded-full bg-bakery-50 dark:bg-bakery-900 flex items-center justify-center mx-auto">
                        <Bell class="w-8 h-8 text-bakery-200 dark:text-bakery-800" />
                      </div>
                      <p class="text-bakery-400 dark:text-bakery-500 font-medium tracking-tight">All caught up!</p>
                    </div>
                    <div 
                      v-for="notif in notifications" 
                      :key="notif.id"
                      @click="markAsRead(notif.id)"
                      class="p-5 border-b border-bakery-50 dark:border-bakery-900/50 hover:bg-bakery-50 dark:hover:bg-bakery-900/50 cursor-pointer transition-all"
                      :class="{ 'bg-bakery-50/30 dark:bg-bakery-900/20': !notif.isRead }"
                    >
                      <div class="flex gap-4">
                        <div :class="`p-3 rounded-xl h-fit ${notif.type === 'success' ? 'bg-success-bg text-success-text' : notif.type === 'warning' ? 'bg-warning-bg text-warning-text' : 'bg-danger-bg text-danger-text'}`">
                          <Bell class="w-4 h-4" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex justify-between items-start mb-1 gap-2">
                            <span class="text-sm font-black text-bakery-900 dark:text-white truncate">{{ notif.title }}</span>
                            <span class="text-[10px] font-black text-bakery-400 dark:text-bakery-500 uppercase tracking-widest flex-shrink-0">{{ formatTime(notif.timestamp) }}</span>
                          </div>
                          <p class="text-xs text-bakery-500 dark:text-bakery-400 leading-relaxed font-semibold italic">{{ notif.message }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Click outside to close -->
              <div v-if="user && isNotificationOpen" @click="isNotificationOpen = false" class="fixed inset-0 z-40"></div>

              <template v-if="user">
                <div class="hidden lg:flex items-center gap-3 px-4 py-2 bg-bakery-50/50 dark:bg-bakery-900/50 rounded-xl border border-bakery-100 dark:border-bakery-800">
                  <div class="w-6 h-6 rounded-full bg-bakery-900 dark:bg-bakery-100 text-white dark:text-bakery-900 flex items-center justify-center text-[10px] font-black uppercase">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-black text-bakery-900 dark:text-white leading-none mb-1">{{ user.name }}</span>
                    <span class="text-[8px] font-black uppercase tracking-widest text-bakery-500 dark:text-bakery-400">{{ user.role }}</span>
                  </div>
                </div>
                
                <button 
                  @click="router.push('/settings')"
                  class="p-2.5 rounded-xl bg-bakery-50/50 dark:bg-bakery-900/50 hover:bg-bakery-100 dark:hover:bg-bakery-800 text-bakery-600 dark:text-bakery-400 border border-bakery-100 dark:border-bakery-800 transition-all"
                  title="Settings"
                >
                  <SettingsIcon class="w-5 h-5" />
                </button>
                
                <button 
                  @click="logout"
                  class="p-2.5 rounded-xl bg-danger-bg hover:bg-danger-text/20 text-danger-text border border-danger-text/10 transition-all"
                  title="Logout"
                >
                  <LogOut class="w-5 h-5" />
                </button>
              </template>
              <template v-else>
                <button 
                  @click="router.push('/login')"
                  class="h-11 px-6 rounded-xl bg-bakery-900 dark:bg-white text-white dark:text-bakery-900 font-black text-sm hover:scale-105 transition-all shadow-xl shadow-bakery-900/20 active:scale-95"
                >
                  Sign In
                </button>
              </template>
            </div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 sm:px-6 py-8">
        <!-- Modern Navigation Tabs -->
        <div class="space-y-8">
            <div class="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
                <div class="inline-flex h-14 items-center bg-white/50 dark:bg-bakery-900/50 backdrop-blur-md rounded-2xl p-1.5 border border-bakery-100 dark:border-bakery-800 gap-1">
                    <router-link
                        v-for="item in navigation"
                        :key="item.name"
                        :to="item.href"
                        class="inline-flex items-center justify-center rounded-xl px-4 sm:px-6 h-full text-xs sm:text-sm font-black uppercase tracking-widest transition-all gap-3"
                        :class="[isActive(item.href) ? 'bg-bakery-900 dark:bg-white text-white dark:text-bakery-900 shadow-xl scale-[1.02]' : 'text-bakery-400 hover:text-bakery-900 dark:hover:text-white hover:bg-bakery-50 dark:hover:bg-bakery-800']"
                    >
                        <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
                        <span>{{ item.name }}</span>
                    </router-link>
                </div>
            </div>

            <!-- Content Area with Animation -->
            <router-view v-slot="{ Component }">
              <transition 
                enter-active-class="animate-in fade-in slide-in-from-bottom-4 duration-500"
                mode="out-in"
              >
                <component :is="Component" />
              </transition>
            </router-view>
        </div>
      </main>
    </div>
</template>
