<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { 
    Clock, 
    User, 
    Truck, 
    MapPin, 
    CheckCircle2, 
    AlertCircle,
    Phone,
    Box as Package
} from 'lucide-vue-next';
import { useDeliveries } from '../composables/useDeliveries';

const props = defineProps<{
    orderId: number;
    active: boolean;
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
    // Poll every 5 seconds to catch status updates from the mock simulator
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
    { key: 'Assigned', label: 'Driver Assigned', icon: User },
    { key: 'Dispatched', label: 'Picked Up', icon: Package }, // Wait, Package isn't imported, I'll use Truck
    { key: 'In Transit', label: 'In Transit', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 }
];


const currentStageIndex = computed(() => {
    if (!delivery.value) return -1;
    const index = stages.findIndex(s => s.key === delivery.value!.status);
    return index === -1 ? 0 : index;
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

</script>

<template>
    <div class="bg-white rounded-2xl border border-bakery-100 p-6 shadow-sm overflow-hidden transition-all duration-500">
        <div v-if="loading && !delivery" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-bakery-600"></div>
        </div>

        <div v-else-if="error" class="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 italic">
            <AlertCircle class="w-5 h-5 shrink-0" />
            <span class="text-sm">Could not find delivery info. It might still be preparing.</span>
        </div>

        <div v-else-if="delivery" class="space-y-8">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-bakery-50 pb-4">
                <div>
                   <h3 class="text-lg font-black text-bakery-900 flex items-center gap-2">
                        <Truck class="w-5 h-5 text-bakery-600" />
                        Live Delivery Tracking
                    </h3>
                    <p class="text-xs font-bold text-bakery-400 uppercase tracking-widest mt-1">
                        Tracking ID: {{ delivery.tracking_number }}
                    </p>
                </div>
                <div class="bg-bakery-50 px-3 py-1.5 rounded-xl border border-bakery-100">
                    <span class="text-xs font-black text-bakery-600 flex items-center gap-1.5 capitalize animate-pulse">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-bakery-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-bakery-600"></span>
                        </span>
                        {{ delivery.status }}
                    </span>
                </div>
            </div>

            <!-- Tracker Steps -->
            <div class="relative px-2 py-4">
                <!-- Progress Line Background -->
                <div class="absolute top-1/2 left-0 w-full h-1 bg-bakery-100 -translate-y-1/2 rounded-full"></div>
                <!-- Active Progress Line -->
                <div 
                    class="absolute top-1/2 left-0 h-1 bg-bakery-600 -translate-y-1/2 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(var(--bakery-600-rgb),0.5)]"
                    :style="{ width: progressWidth }"
                ></div>

                <!-- Step Points -->
                <div class="relative flex justify-between">
                    <div 
                        v-for="(stage, index) in stages" 
                        :key="stage.key"
                        class="flex flex-col items-center gap-2 group"
                    >
                        <div 
                            :class="[
                                'w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10',
                                getStageStatus(index) === 'completed' ? 'bg-bakery-600 border-bakery-600 shadow-lg' :
                                getStageStatus(index) === 'active' ? 'bg-white border-bakery-600 shadow-md scale-110 ring-4 ring-bakery-50' :
                                'bg-white border-bakery-100'
                            ]"
                        >
                            <component 
                                :is="stage.icon" 
                                :class="[
                                    'w-5 h-5 transition-colors duration-500',
                                    getStageStatus(index) === 'completed' ? 'text-white' :
                                    getStageStatus(index) === 'active' ? 'text-bakery-600' :
                                    'text-bakery-200 group-hover:text-bakery-300'
                                ]" 
                            />
                        </div>
                        <span 
                            :class="[
                                'absolute top-full mt-3 text-[10px] sm:text-xs font-bold transition-all duration-500 whitespace-nowrap',
                                getStageStatus(index) === 'upcoming' ? 'text-bakery-200' : 'text-bakery-900'
                            ]"
                        >
                            {{ stage.label }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Driver Info Card -->
            <div v-if="delivery.driver_name" class="mt-12 flex items-center gap-4 bg-bakery-50/50 p-4 rounded-2xl border border-bakery-100 animate-in fade-in slide-in-from-bottom-2">
                <div class="w-12 h-12 rounded-xl bg-white border border-bakery-100 flex items-center justify-center text-bakery-600 shadow-sm font-black text-lg uppercase">
                    {{ delivery.driver_name.charAt(0) }}
                </div>
                <div class="flex-1">
                    <p class="text-[10px] font-black text-bakery-400 uppercase tracking-widest">Courier Partner</p>
                    <h4 class="text-sm font-bold text-bakery-900">{{ delivery.driver_name }}</h4>
                </div>
                <a 
                    v-if="delivery.driver_phone"
                    :href="'tel:' + delivery.driver_phone" 
                    class="w-10 h-10 rounded-xl bg-bakery-600 text-white flex items-center justify-center shadow-lg hover:bg-bakery-700 hover:-translate-y-1 transition-all active:scale-95"
                >
                    <Phone class="w-4 h-4" />
                </a>
            </div>

            <!-- Estimated Time -->
            <div v-if="delivery.status !== 'Delivered'" class="flex items-center gap-2 text-xs font-bold text-bakery-500 justify-center sm:justify-start">
                <MapPin class="w-4 h-4 text-bakery-400" />
                Arriving in approx. <span class="text-bakery-900">25-40 mins</span>
            </div>
        </div>

        <div v-else class="text-center py-10 opacity-50">
            <Truck class="w-12 h-12 text-bakery-200 mx-auto mb-3" />
            <p class="text-sm font-bold text-bakery-900">Delivery Status Pending</p>
            <p class="text-xs text-bakery-500 mt-1">We'll show tracking once the baker is ready!</p>
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
