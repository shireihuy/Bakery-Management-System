<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
    AlertCircle,
    Box as Package,
    CheckCircle2,
    Clock,
    Phone,
    Truck,
    User
} from 'lucide-vue-next';
import { useDeliveries } from '../composables/useDeliveries';

const props = defineProps<{
    orderId: number;
    active: boolean;
    destination?: string;
}>();

const { delivery, fetchDeliveryByOrderId, loading, error } = useDeliveries();
const pollingInterval = ref<any>(null);

const fetchDetails = async () => {
    if (props.orderId) {
        await fetchDeliveryByOrderId(props.orderId);
    }
};

const startPolling = () => {
    stopPolling();
    pollingInterval.value = setInterval(fetchDetails, 5000);
};

const stopPolling = () => {
    if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
        pollingInterval.value = null;
    }
};

onMounted(() => {
    fetchDetails();
    if (props.active) startPolling();
});

onUnmounted(() => {
    stopPolling();
});

watch(() => props.active, (isActive) => {
    if (isActive) startPolling();
    else stopPolling();
});

watch(() => props.orderId, () => {
    fetchDetails();
});

const stages = [
    { key: 'Pending', label: 'Preparing', icon: Clock },
    { key: 'Searching', label: 'Finding Courier', icon: User },
    { key: 'Assigned', label: 'Driver Assigned', icon: User },
    { key: 'Picked Up', label: 'Picked Up', icon: Package },
    { key: 'In Transit', label: 'In Transit', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 }
];

const currentStageIndex = computed(() => {
    if (!delivery.value) return -1;
    const index = stages.findIndex(s => s.key === delivery.value!.status);
    if (index !== -1) return index;
    if (delivery.value.status === 'Failed') return 0;
    return 0;
});

const statusMeta = computed(() => {
    const status = delivery.value?.status || 'Pending';
    switch (status) {
        case 'Searching':
            return {
                label: 'Looking for courier',
                tone: 'bg-amber-50 text-amber-700 border-amber-100',
                dot: 'bg-amber-500',
                hint: 'GHN is finding a driver for this order.'
            };
        case 'Assigned':
            return {
                label: 'Courier assigned',
                tone: 'bg-blue-50 text-blue-700 border-blue-100',
                dot: 'bg-blue-500',
                hint: 'A driver has accepted the delivery.'
            };
        case 'Picked Up':
            return {
                label: 'Package picked up',
                tone: 'bg-violet-50 text-violet-700 border-violet-100',
                dot: 'bg-violet-500',
                hint: 'The order has left the bakery.'
            };
        case 'In Transit':
            return {
                label: 'On the way',
                tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                dot: 'bg-emerald-500',
                hint: 'The courier is heading to the destination.'
            };
        case 'Delivered':
            return {
                label: 'Delivered',
                tone: 'bg-green-50 text-green-700 border-green-100',
                dot: 'bg-green-500',
                hint: 'The order reached the customer.'
            };
        case 'Failed':
            return {
                label: 'Delivery issue',
                tone: 'bg-red-50 text-red-700 border-red-100',
                dot: 'bg-red-500',
                hint: 'Delivery needs attention.'
            };
        default:
            return {
                label: 'Preparing',
                tone: 'bg-stone-50 text-stone-700 border-stone-100',
                dot: 'bg-stone-500',
                hint: 'The order is being prepared for dispatch.'
            };
    }
});

const getStageStatus = (index: number) => {
    if (currentStageIndex.value > index) return 'completed';
    if (currentStageIndex.value === index) return 'active';
    return 'upcoming';
};

const progressWidth = computed(() => {
    if (currentStageIndex.value === -1) return '0%';
    return `${(currentStageIndex.value / (stages.length - 1)) * 100}%`;
});

const mapUrl = computed(() => {
    const address = props.destination || 'Vietnam';
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
});
</script>

<template>
    <div class="relative overflow-hidden rounded-3xl border border-bakery-100 bg-gradient-to-br from-white via-white to-bakery-50/40 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.05)] transition-all duration-500 sm:p-6">
        <div class="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-bakery-100/60 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-amber-100/50 blur-3xl"></div>

        <div v-if="loading && !delivery" class="flex items-center justify-center py-8">
            <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-bakery-600"></div>
        </div>

        <div v-else-if="error" class="relative flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 italic text-red-700">
            <AlertCircle class="h-5 w-5 shrink-0" />
            <span class="text-sm">Could not find delivery info. It might still be preparing.</span>
        </div>

        <div v-else-if="delivery" class="space-y-8">
            <div class="relative flex flex-col items-start justify-between gap-4 border-b border-bakery-50 pb-5 sm:flex-row sm:items-center">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span :class="`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusMeta.tone}`">
                            <span :class="`h-2 w-2 rounded-full ${statusMeta.dot} animate-pulse`"></span>
                            {{ statusMeta.label }}
                        </span>
                    </div>
                    <h3 class="flex items-center gap-2 text-xl font-black text-bakery-900">
                        <Truck class="h-5 w-5 text-bakery-600" />
                        Delivery Tracker
                    </h3>
                    <p class="mt-1 text-xs font-bold uppercase tracking-widest text-bakery-400">
                        Tracking ID: {{ delivery.tracking_number }}
                    </p>
                    <p class="mt-1 max-w-xl text-xs text-bakery-500">
                        {{ statusMeta.hint }}
                    </p>
                </div>

                <div class="rounded-2xl border border-bakery-100 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
                    <span class="flex items-center gap-1.5 text-xs font-black capitalize text-bakery-600">
                        <span class="relative flex h-2 w-2">
                            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-bakery-400 opacity-75"></span>
                            <span class="relative inline-flex h-2 w-2 rounded-full bg-bakery-600"></span>
                        </span>
                        {{ delivery.status }}
                    </span>
                </div>
            </div>

            <div class="relative px-2 py-4">
                <div class="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-bakery-100/80"></div>
                <div
                    class="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-bakery-500 via-bakery-600 to-amber-500 transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(var(--bakery-600-rgb),0.35)]"
                    :style="{ width: progressWidth }"
                ></div>

                <div class="relative flex justify-between gap-2 sm:gap-0">
                    <div
                        v-for="(stage, index) in stages"
                        :key="stage.key"
                        class="group flex min-w-0 flex-1 flex-col items-center gap-2"
                    >
                        <div
                            :class="[
                                'z-10 flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all duration-500 sm:h-11 sm:w-11',
                                getStageStatus(index) === 'completed' ? 'border-bakery-600 bg-bakery-600 shadow-lg shadow-bakery-600/20' :
                                getStageStatus(index) === 'active' ? 'scale-110 border-bakery-600 bg-white shadow-md ring-4 ring-bakery-50' :
                                'border-bakery-100 bg-white'
                            ]"
                        >
                            <component
                                :is="stage.icon"
                                :class="[
                                    'h-5 w-5 transition-colors duration-500',
                                    getStageStatus(index) === 'completed' ? 'text-white' :
                                    getStageStatus(index) === 'active' ? 'text-bakery-600' :
                                    'text-bakery-200 group-hover:text-bakery-300'
                                ]"
                            />
                        </div>
                        <span
                            :class="[
                                'absolute top-full mt-3 px-1 text-center text-[10px] font-bold transition-all duration-500 whitespace-nowrap sm:text-xs',
                                getStageStatus(index) === 'upcoming' ? 'text-bakery-300' : 'text-bakery-900'
                            ]"
                        >
                            {{ stage.label }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="relative mt-8 h-48 overflow-hidden rounded-3xl border border-bakery-100 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:h-64 group">
                <iframe
                    :key="mapUrl"
                    width="100%"
                    height="100%"
                    style="border:0;"
                    loading="lazy"
                    allowfullscreen
                    :src="mapUrl"
                ></iframe>
                <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-bakery-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-1 sm:left-auto sm:right-4 sm:gap-4 sm:justify-start">
                    <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-bakery-50 text-bakery-600 ring-4 ring-bakery-50">
                            <Truck class="h-5 w-5" />
                        </div>
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400">Routing to</p>
                            <p class="max-w-[150px] truncate text-xs font-bold text-bakery-900 sm:max-w-[200px] sm:text-sm">
                                {{ props.destination || 'Destination' }}
                            </p>
                        </div>
                    </div>
                    <div v-if="delivery.status !== 'Delivered' && delivery.status !== 'Failed'" class="pl-3 text-right sm:border-l sm:border-bakery-100 sm:text-left">
                        <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400">Est. Time</p>
                        <p class="truncate text-xs font-bold text-bakery-900 sm:text-sm">25-40 mins</p>
                    </div>
                </div>
            </div>

            <div v-if="delivery.driver_name" class="mt-6 flex items-center gap-4 rounded-3xl border border-bakery-100 bg-gradient-to-r from-bakery-50/70 to-white p-4 animate-in fade-in slide-in-from-bottom-2">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-bakery-100 bg-white text-lg font-black uppercase text-bakery-600 shadow-sm">
                    {{ delivery.driver_name.charAt(0) }}
                </div>
                <div class="flex-1">
                    <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400">Courier Partner</p>
                    <h4 class="text-sm font-bold text-bakery-900">{{ delivery.driver_name }}</h4>
                </div>
                <a
                    v-if="delivery.driver_phone"
                    :href="'tel:' + delivery.driver_phone"
                    class="flex h-10 w-10 items-center justify-center rounded-2xl bg-bakery-600 text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-bakery-700 active:scale-95"
                >
                    <Phone class="h-4 w-4" />
                </a>
            </div>
        </div>

        <div v-else class="py-10 text-center opacity-50">
            <Truck class="mx-auto mb-3 h-12 w-12 text-bakery-200" />
            <p class="text-sm font-bold text-bakery-900">Delivery Status Pending</p>
            <p class="mt-1 text-xs text-bakery-500">We'll show tracking once the order is ready for dispatch.</p>
        </div>
    </div>
</template>

<style scoped>
@keyframes cart-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.animate-cart-bounce {
  animation: cart-bounce 0.6s ease-in-out;
}
</style>
