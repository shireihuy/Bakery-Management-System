<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
    Bell, 
    CheckCircle2, 
    XCircle, 
    Trash2, 
    Clock, 
    Filter,
    CheckCheck,
    AlertTriangle,
    Info,
    Check
} from 'lucide-vue-next';
import { useNotifications } from '../composables/useNotifications';

const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

const filterType = ref('all');

const filteredNotifications = computed(() => {
    if (filterType.value === 'all') return notifications.value;
    return notifications.value.filter(n => n.type === filterType.value);
});

const formatFullDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

const getIcon = (type: string) => {
    switch (type) {
        case 'success': return CheckCircle2;
        case 'warning': return AlertTriangle;
        case 'error': return XCircle;
        default: return Info;
    }
};

const getStyles = (type: string, isRead: boolean) => {
    const base = isRead ? 'bg-white' : 'bg-green-50/30';
    switch (type) {
        case 'success': return { bg: base, icon: 'text-green-500 bg-green-50' };
        case 'warning': return { bg: base, icon: 'text-orange-500 bg-orange-50' };
        case 'error': return { bg: base, icon: 'text-red-500 bg-red-50' };
        default: return { bg: base, icon: 'text-blue-500 bg-blue-50' };
    }
};
</script>

<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-green-900 flex items-center gap-3">
                    <Bell class="w-6 h-6 text-green-600" />
                    Notifications Center
                </h2>
                <p class="text-sm text-green-600">Stay updated with the latest bakery activity</p>
            </div>
            <button 
                @click="markAllAsRead"
                class="flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
            >
                <CheckCheck class="w-4 h-4" />
                Mark all as read
            </button>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
            <div class="flex items-center gap-4">
                <span class="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Filter class="w-4 h-4" /> Filter by:
                </span>
                <div class="flex gap-2">
                    <button 
                        v-for="type in ['all', 'info', 'success', 'warning', 'error']" 
                        :key="type"
                        @click="filterType = type"
                        :class="[filterType === type ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100']"
                        class="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
                    >
                        {{ type }}
                    </button>
                </div>
            </div>
            <span class="text-xs text-gray-400 font-medium">
                Total: {{ filteredNotifications.length }} alerts
            </span>
        </div>

        <!-- Notifications List -->
        <div class="space-y-3">
            <div v-if="filteredNotifications.length === 0" class="bg-white p-12 text-center rounded-2xl border border-green-100 shadow-sm">
                <Bell class="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 class="text-lg font-bold text-gray-900">No Notifications Found</h3>
                <p class="text-gray-500">You're all caught up! Check back later for updates.</p>
            </div>

            <div 
                v-for="notif in filteredNotifications" 
                :key="notif.id"
                class="group bg-white rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-all p-4 flex gap-4"
                :class="{ 'opacity-70 bg-gray-50/50': notif.isRead }"
            >
                <div :class="`p-3 rounded-xl h-fit border ${getStyles(notif.type, notif.isRead).icon} border-current/10`">
                    <component :is="getIcon(notif.type)" class="w-5 h-5" />
                </div>
                
                <div class="flex-1 space-y-1">
                    <div class="flex justify-between items-start">
                        <h4 class="font-bold text-gray-900" :class="{ 'font-semibold': notif.isRead }">
                            {{ notif.title }}
                            <span v-if="!notif.isRead" class="ml-2 inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        </h4>
                        <span class="text-xs text-gray-400 flex items-center gap-1">
                            <Clock class="w-3 h-3" /> {{ formatFullDate(notif.timestamp) }}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 leading-relaxed">{{ notif.message }}</p>
                    
                    <div class="pt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            v-if="!notif.isRead"
                            @click="markAsRead(notif.id)"
                            class="text-xs font-bold text-green-600 hover:text-green-800 flex items-center gap-1 pr-3 border-r border-gray-100"
                        >
                            <Check class="w-3 h-3" /> Mark as read
                        </button>
                        <button 
                            @click="deleteNotification(notif.id)"
                            class="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                            <Trash2 class="w-3 h-3" /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
