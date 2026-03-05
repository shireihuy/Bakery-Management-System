<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useI18n } from '../composables/useI18n';
import { User, Save, Ticket, Key } from 'lucide-vue-next';

const { user, updateProfile } = useAuth();
const { t } = useI18n();

const formData = ref({
    name: '',
    email: '',
    phone: '',
    address: ''
});

const isSaving = ref(false);
const activeTab = ref<'profile' | 'coupons'>('profile');
const message = ref({ text: '', type: '' as 'success' | 'error' | '' });

onMounted(() => {
    if (user.value) {
        formData.value = {
            name: user.value.name,
            email: user.value.email,
            phone: user.value.phone || '',
            address: user.value.address || ''
        };
    }
});

const handleSave = async () => {
    isSaving.value = true;
    message.value = { text: '', type: '' };

    try {
        await updateProfile({
            name: formData.value.name,
            email: formData.value.email,
            phone: formData.value.phone,
            address: formData.value.address
        });
        
        message.value = { text: t('settings.profileUpdated'), type: 'success' };
    } catch (error) {
        message.value = { text: t('settings.profileUpdateFailed'), type: 'error' };
    } finally {
        isSaving.value = false;
    }
};
</script>

<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <div class="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-green-100 bg-green-50/50">
                <h2 class="text-xl font-bold text-green-900 flex items-center gap-2">
                    <User class="w-5 h-5 text-green-600" />
                    {{ t('settings.accountSettings') }}
                </h2>
                <p class="text-sm text-green-600 mt-1">{{ t('settings.managePersonal') }}</p>
            </div>
            
            <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Sidebar / Navigation for Settings (Visual only for now) -->
                <div class="space-y-2">
                    <button 
                        @click="activeTab = 'profile'"
                        class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium border"
                        :class="activeTab === 'profile' ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' : 'text-gray-600 hover:bg-gray-50 border-transparent'"
                    >
                        <User class="w-4 h-4" />
                        {{ t('settings.profile') }}
                    </button>
                    <button 
                        @click="activeTab = 'coupons'"
                        class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium border"
                        :class="activeTab === 'coupons' ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' : 'text-gray-600 hover:bg-gray-50 border-transparent'"
                    >
                        <Ticket class="w-4 h-4" />
                        {{ t('settings.coupons') }}
                    </button>
                </div>

                <!-- Main Form (Profile Tab) -->
                <div v-if="activeTab === 'profile'" class="md:col-span-2 space-y-6">
                    <form @submit.prevent="handleSave" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="text-sm font-medium text-gray-700">{{ t('settings.fullName') }}</label>
                                <div class="relative">
                                    <input 
                                        v-model="formData.name"
                                        type="text" 
                                        class="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            
                            <div class="space-y-1">
                                <label class="text-sm font-medium text-gray-700">{{ t('settings.emailAddress') }}</label>
                                <div class="relative">
                                    <input 
                                        v-model="formData.email"
                                        type="email" 
                                        class="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            
                            <div class="space-y-1">
                                <label class="text-sm font-medium text-gray-700">{{ t('settings.phoneNumber') }}</label>
                                <div class="relative">
                                    <input 
                                        v-model="formData.phone"
                                        type="tel" 
                                        class="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                            
                            <div class="space-y-1">
                                <label class="text-sm font-medium text-gray-700">{{ t('settings.role') }}</label>
                                <div class="relative">
                                    <input 
                                        :value="user?.role"
                                        type="text" 
                                        disabled
                                        class="w-full pl-3 pr-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg capitalize cursor-not-allowed"
                                    />
                                    <Key class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ t('settings.address') }}</label>
                            <textarea 
                                v-model="formData.address"
                                rows="3"
                                class="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                                placeholder="123 Main St, City, Country"
                            ></textarea>
                        </div>

                        <div v-if="message.text" :class="`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`">
                            {{ message.text }}
                        </div>

                        <div class="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                :disabled="isSaving"
                                class="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <Save v-if="!isSaving" class="w-4 h-4" />
                                <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {{ isSaving ? t('settings.saving') : t('settings.saveChanges') }}
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Coupons Tab (Placeholder) -->
                <div v-else class="md:col-span-2 space-y-6">
                    <div class="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div class="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Ticket class="w-8 h-8 text-green-500" />
                        </div>
                        <h3 class="text-lg font-bold text-gray-900">{{ t('settings.coupons') }}</h3>
                        <p class="text-gray-500 max-w-xs mx-auto mt-2">
                            You don't have any active coupons right now. Keep an eye out for special bakery promotions!
                        </p>
                        <button class="mt-6 px-6 py-2 bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 transition-colors">
                            Explore Current Offers
                        </button>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        <!-- Sample Placeholder Coupon Card -->
                        <div class="group relative overflow-hidden bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg opacity-60">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="text-xs font-bold uppercase tracking-wider opacity-80">Welcome Offer</div>
                                    <div class="text-2xl font-black">15% OFF</div>
                                </div>
                                <div class="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold">EXPIRED</div>
                            </div>
                            <div class="mt-4 flex items-center gap-2 text-sm">
                                <span class="font-mono bg-black/10 px-2 py-0.5 rounded">BAKERY15</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
