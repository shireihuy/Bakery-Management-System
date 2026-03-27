<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useI18n } from '../composables/useI18n';
import { useCurrency } from '../composables/useCurrency';
import { User, Save, Ticket, Key, CreditCard, MapPin, Store } from 'lucide-vue-next';
import { useGHN } from '../composables/useGHN';

const { user, updateProfile } = useAuth();
const { t } = useI18n();
const { formatPrice } = useCurrency();

const formData = ref({
    name: '',
    email: '',
    phone: '',
    address: '',
    province_id: null as number | null,
    district_id: null as number | null,
    ward_code: null as string | null
});

const { provinces, districts, wards, fetchProvinces, fetchDistricts, fetchWards } = useGHN();

const onProvinceChange = () => {
    formData.value.district_id = null;
    formData.value.ward_code = null;
    if (formData.value.province_id) {
        fetchDistricts(formData.value.province_id);
    }
};

const onDistrictChange = () => {
    formData.value.ward_code = null;
    if (formData.value.district_id) {
        fetchWards(formData.value.district_id);
    }
};

const isSaving = ref(false);
const activeTab = ref<'profile' | 'coupons' | 'payment' | 'location'>('profile');
const message = ref({ text: '', type: '' as 'success' | 'error' | '' });

const coupons = ref<any[]>([]);
const isCouponsLoading = ref(false);
const showCouponModal = ref(false);
const currentCoupon = ref<any>({
    code: '', discount_type: 'percentage', discount_value: 0, min_purchase_amount: 0,
    usage_limit: null, start_date: '', end_date: '', is_active: true
});

const isAdminOrManager = computed(() => {
    return ['admin', 'manager'].includes(user.value?.role?.toLowerCase() || '');
});

const paymentConfig = ref({
    bankId: '',
    accountNumber: '',
    accountName: '',
    messageTemplate: '',
    vndRate: 25000,
    jpyRate: 150
});
const isPaymentLoading = ref(false);

const loadPaymentSettings = async () => {
    if (!isAdminOrManager.value) return;
    isPaymentLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payment/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            paymentConfig.value = await response.json();
        }
    } catch (e) {
        console.error('Failed loading payment settings', e);
    } finally {
        isPaymentLoading.value = false;
    }
};

const savePaymentSettings = async () => {
    isSaving.value = true;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payment/settings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentConfig.value)
        });
        
        if (res.ok) {
            message.value = { text: 'Payment settings updated', type: 'success' };
        } else {
            throw new Error();
        }
    } catch (e) {
        message.value = { text: 'Failed to update payment settings', type: 'error' };
    } finally {
        isSaving.value = false;
    }
};

const storeLocationConfig = ref({
    province_id: null as number | null,
    district_id: null as number | null,
    ward_code: null as string | null,
    address: ''
});
const isLocationLoading = ref(false);

const onStoreProvinceChange = () => {
    storeLocationConfig.value.district_id = null;
    storeLocationConfig.value.ward_code = null;
    if (storeLocationConfig.value.province_id) {
        fetchDistricts(storeLocationConfig.value.province_id);
    }
};

const onStoreDistrictChange = () => {
    storeLocationConfig.value.ward_code = null;
    if (storeLocationConfig.value.district_id) {
        fetchWards(storeLocationConfig.value.district_id);
    }
};

const loadStoreLocationConfig = async () => {
    if (!isAdminOrManager.value) return;
    isLocationLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/system/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const settings = await response.json();
            if (settings.store_location_config) {
                storeLocationConfig.value = settings.store_location_config;
                if (storeLocationConfig.value.province_id) {
                    await fetchDistricts(storeLocationConfig.value.province_id);
                    if (storeLocationConfig.value.district_id) {
                        await fetchWards(storeLocationConfig.value.district_id);
                    }
                }
            }
        }
    } catch (e) {
        console.error('Failed loading store location settings', e);
    } finally {
        isLocationLoading.value = false;
    }
};

const saveStoreLocationConfig = async () => {
    isSaving.value = true;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/system/settings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ key: 'store_location_config', value: storeLocationConfig.value })
        });
        
        if (res.ok) {
            message.value = { text: 'Store location updated', type: 'success' };
        } else {
            throw new Error();
        }
    } catch (e) {
        message.value = { text: 'Failed to update store location', type: 'error' };
    } finally {
        isSaving.value = false;
    }
};

const loadCoupons = async () => {
    isCouponsLoading.value = true;
    try {
        const response = await fetch('http://localhost:3000/api/coupons', {
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            coupons.value = await response.json();
        }
    } catch(e) {
        console.error('Failure loading coupons', e);
    } finally {
        isCouponsLoading.value = false;
    }
};

const saveCoupon = async () => {
    try {
        const method = currentCoupon.value.id ? 'PUT' : 'POST';
        const url = currentCoupon.value.id 
            ? `http://localhost:3000/api/coupons/${currentCoupon.value.id}` 
            : 'http://localhost:3000/api/coupons';
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentCoupon.value)
        });
        
        if(res.ok) {
            await loadCoupons();
            showCouponModal.value = false;
        }
    } catch(e) {
        console.error('Failed to save coupon', e);
    }
};

const deleteCoupon = async (id: string) => {
    if(!confirm('Are you sure you want to delete this coupon?')) return;
    try {
        const res = await fetch(`http://localhost:3000/api/coupons/${id}`, { method: 'DELETE' });
        if(res.ok) await loadCoupons();
    } catch(e) {
        console.error('Failed delete', e);
    }
};

const toggleCouponStatus = async (coupon: any) => {
    try {
        const updated = { ...coupon, is_active: !coupon.is_active };
        const res = await fetch(`http://localhost:3000/api/coupons/${coupon.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        if(res.ok) await loadCoupons();
    } catch(e) {
        console.error('Failed status toggle', e);
    }
};

const openAddCoupon = () => {
    currentCoupon.value = { code: '', discount_type: 'percentage', discount_value: 0, min_purchase_amount: 0, usage_limit: null, start_date: '', end_date: '', is_active: true };
    showCouponModal.value = true;
};

onMounted(async () => {
    if (user.value) {
        formData.value = {
            name: user.value.name,
            email: user.value.email,
            phone: user.value.phone || '',
            address: user.value.address || '',
            province_id: user.value.province_id || null,
            district_id: user.value.district_id || null,
            ward_code: user.value.ward_code || null
        };
        
        await fetchProvinces();
        if (user.value.province_id) {
            await fetchDistricts(user.value.province_id);
            if (user.value.district_id) {
                await fetchWards(user.value.district_id);
            }
        }
    }
    loadCoupons();
    loadPaymentSettings();
    loadStoreLocationConfig();
});

const handleSave = async () => {
    isSaving.value = true;
    message.value = { text: '', type: '' };

    try {
        await updateProfile({
            name: formData.value.name,
            email: formData.value.email,
            phone: formData.value.phone,
            address: formData.value.address,
            province_id: formData.value.province_id ?? undefined,
            district_id: formData.value.district_id ?? undefined,
            ward_code: formData.value.ward_code ?? undefined
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
                    <button 
                        v-if="isAdminOrManager"
                        @click="activeTab = 'payment'"
                        class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium border"
                        :class="activeTab === 'payment' ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' : 'text-gray-600 hover:bg-gray-50 border-transparent'"
                    >
                        <CreditCard class="w-4 h-4" />
                        Card & QR Payments
                    </button>
                    <button 
                        v-if="isAdminOrManager"
                        @click="activeTab = 'location'"
                        class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium border"
                        :class="activeTab === 'location' ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' : 'text-gray-600 hover:bg-gray-50 border-transparent'"
                    >
                        <Store class="w-4 h-4" />
                        Store Location
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

                        <div class="space-y-4">
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <MapPin class="w-4 h-4 text-green-600" />
                                Location Details
                            </label>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="space-y-1">
                                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Province</label>
                                    <select 
                                        v-model="formData.province_id" 
                                        @change="onProvinceChange"
                                        class="w-full h-10 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500"
                                    >
                                        <option :value="null" disabled>Select Province</option>
                                        <option v-for="p in provinces" :key="p.ProvinceID" :value="p.ProvinceID">{{ p.ProvinceName }}</option>
                                    </select>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">District</label>
                                    <select 
                                        v-if="formData.province_id"
                                        v-model="formData.district_id" 
                                        @change="onDistrictChange"
                                        class="w-full h-10 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500"
                                    >
                                        <option :value="null" disabled>Select District</option>
                                        <option v-for="d in districts" :key="d.DistrictID" :value="d.DistrictID">{{ d.DistrictName }}</option>
                                    </select>
                                    <div v-else class="h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3 text-xs text-gray-400">Select province first</div>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ward</label>
                                    <select 
                                        v-if="formData.district_id"
                                        v-model="formData.ward_code"
                                        class="w-full h-10 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500"
                                    >
                                        <option :value="null" disabled>Select Ward</option>
                                        <option v-for="w in wards" :key="w.WardCode" :value="w.WardCode">{{ w.WardName }}</option>
                                    </select>
                                    <div v-else class="h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3 text-xs text-gray-400">Select district first</div>
                                </div>
                            </div>

                            <div class="space-y-1">
                                <label class="text-sm font-medium text-gray-700">Street Address</label>
                                <textarea 
                                    v-model="formData.address"
                                    rows="2"
                                    class="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                                    placeholder="House No, Street name..."
                                ></textarea>
                            </div>
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

                <div v-else-if="activeTab === 'coupons'" class="md:col-span-2 space-y-6">
                    <div class="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                         <div>
                             <h3 class="text-xl font-bold text-gray-900">{{ t('settings.coupons') || 'Coupon Management' }}</h3>
                             <p class="text-sm text-gray-500">{{ isAdminOrManager ? 'Create and manage store discounts' : 'Available coupons for your orders' }}</p>
                         </div>
                         <button 
                             v-if="isAdminOrManager"
                             @click="openAddCoupon"
                             class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm transition-colors"
                         >
                             <Ticket class="w-4 h-4" /> Add Coupon
                         </button>
                    </div>

                    <div v-if="isCouponsLoading" class="text-center py-12">Loading...</div>
                    <div v-else-if="coupons.length === 0" class="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div class="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Ticket class="w-8 h-8 text-green-500" />
                        </div>
                        <p class="text-gray-500 max-w-xs mx-auto">No coupons available at the moment.</p>
                    </div>

                    <div v-else class="grid grid-cols-1 gap-4">
                        <div v-for="coupon in coupons" :key="coupon.id" 
                             class="group relative overflow-hidden rounded-xl p-4 text-white shadow-lg transition-all"
                             :class="coupon.is_active ? 'bg-linear-to-br from-green-500 to-emerald-600' : 'bg-linear-to-br from-gray-400 to-gray-500 opacity-80'">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="text-xs font-bold uppercase tracking-wider opacity-80">{{ coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount' }} Off</div>
                                    <div class="text-2xl font-black">
                                        {{ coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : formatPrice(coupon.discount_value) }} OFF
                                    </div>
                                    <div class="text-xs mt-1 bg-black/20 inline-block px-2 py-0.5 rounded backdrop-blur-sm">Min Spend: {{ formatPrice(coupon.min_purchase_amount) }}</div>
                                </div>
                                <div class="flex gap-2 items-center">
                                    <span v-if="!coupon.is_active" class="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold">INACTIVE</span>
                                    <span v-else-if="coupon.end_date && new Date(coupon.end_date) < new Date()" class="bg-orange-500 text-white px-2 py-1 rounded text-[10px] font-bold">EXPIRED</span>
                                    <span v-else class="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold">ACTIVE</span>
                                </div>
                            </div>
                            <div class="mt-4 flex items-center justify-between text-sm">
                                <span class="font-mono bg-black/20 shadow-inner px-3 py-1 text-lg rounded-lg font-black tracking-widest">{{ coupon.code }}</span>
                                <div v-if="isAdminOrManager" class="flex gap-2">
                                    <button @click="toggleCouponStatus(coupon)" class="px-3 py-1 bg-white/10 hover:bg-white/30 rounded backdrop-blur-sm transition-colors text-xs font-bold border border-white/20">
                                        {{ coupon.is_active ? 'Disable' : 'Enable' }}
                                    </button>
                                    <button @click="deleteCoupon(coupon.id)" class="px-3 py-1 bg-red-500/80 hover:bg-red-600 rounded backdrop-blur-sm transition-colors text-xs font-bold">
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div class="mt-2 text-xs opacity-70 flex justify-between">
                                <span>Used: {{ coupon.usage_count }}{{ coupon.usage_limit ? ' / ' + coupon.usage_limit : '' }}</span>
                                <span v-if="coupon.end_date">Expires: {{ new Date(coupon.end_date).toLocaleDateString() }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Settings Tab -->
                <div v-else-if="activeTab === 'payment' && isAdminOrManager" class="md:col-span-2 space-y-6">
                    <div class="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                        <div class="text-amber-600 mt-0.5">ℹ️</div>
                        <p class="text-xs text-amber-800 leading-relaxed">
                            Configure your bakery's bank and wallet details. This information is used to generate <strong>Dynamic QR Codes</strong> for MoMo, ZaloPay, and Mobile Banking.
                        </p>
                    </div>

                    <form @submit.prevent="savePaymentSettings" class="space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Bank/Service Provider</label>
                                <select v-model="paymentConfig.bankId" class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 bg-white">
                                    <option value="vpb">VP Bank</option>
                                    <option value="ocb">OCB (Orient Commercial Bank)</option>
                                    <option value="momo">MoMo Wallet (Business)</option>
                                    <option value="zalopay">ZaloPay Business</option>
                                    <option value="vcb">Vietcombank</option>
                                    <option value="tcb">Techcombank</option>
                                    <option value="acb">ACB</option>
                                </select>
                            </div>
                            <div class="space-y-1">
                                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Number / Phone</label>
                                <input v-model="paymentConfig.accountNumber" type="text" class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500" placeholder="e.g. 09XXXXXXX">
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Holder Name</label>
                            <input v-model="paymentConfig.accountName" type="text" class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 uppercase font-mono" placeholder="THE ARTISAN BAKERY">
                        </div>

                        <div class="space-y-1">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction Message Format</label>
                            <input v-model="paymentConfig.messageTemplate" type="text" class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500" placeholder="Bakery Payment for #{orderId}">
                            <p class="text-[10px] text-gray-400">Use <code>{orderId}</code> to automatically insert the order number.</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div class="space-y-1">
                                <label class="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                                    VND Exchange Rate (1 USD =)
                                </label>
                                <div class="relative">
                                    <input 
                                        v-model.number="paymentConfig.vndRate" 
                                        type="number" 
                                        step="1"
                                        class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 font-bold" 
                                        placeholder="e.g. 25000"
                                    >
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">₫</span>
                                </div>
                                <p class="text-[10px] text-gray-400 italic">Recommended: Use clean values like 25000 or 25500</p>
                            </div>
                            <div class="space-y-1">
                                <label class="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                    JPY Exchange Rate (1 USD =)
                                </label>
                                <div class="relative">
                                    <input 
                                        v-model.number="paymentConfig.jpyRate" 
                                        type="number" 
                                        step="1"
                                        class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 font-bold" 
                                        placeholder="e.g. 150"
                                    >
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">¥</span>
                                </div>
                                <p class="text-[10px] text-gray-400 italic">Recommended: Use clean values like 150 or 155</p>
                            </div>
                        </div>

                        <div v-if="message.text" :class="`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`">
                            {{ message.text }}
                        </div>

                        <div class="flex justify-end pt-2">
                             <button 
                                type="submit" 
                                :disabled="isSaving"
                                class="flex items-center gap-2 px-8 py-3 bg-bakery-900 text-white font-black rounded-2xl hover:bg-black transition-all disabled:opacity-50"
                            >
                                <Save v-if="!isSaving" class="w-4 h-4" />
                                <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {{ isSaving ? 'Saving Settings...' : 'Update Payment Settings' }}
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Store Location Tab -->
                <div v-else-if="activeTab === 'location' && isAdminOrManager" class="md:col-span-2 space-y-6">
                    <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                        <div class="text-blue-600 mt-0.5"><Store class="w-5 h-5"/></div>
                        <p class="text-xs text-blue-800 leading-relaxed">
                            Configure your bakery's physical location. This address will be used as the <strong>Origin Address</strong> for all GHN delivery calculations.
                        </p>
                    </div>

                    <form @submit.prevent="saveStoreLocationConfig" class="space-y-5 flex flex-col">
                        <div class="space-y-4">
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <MapPin class="w-4 h-4 text-blue-600" />
                                Bakery Location Details
                            </label>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="space-y-1">
                                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Province</label>
                                    <select 
                                        v-model="storeLocationConfig.province_id" 
                                        @change="onStoreProvinceChange"
                                        class="w-full h-10 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option :value="null" disabled>Select Province</option>
                                        <option v-for="p in provinces" :key="p.ProvinceID" :value="p.ProvinceID">{{ p.ProvinceName }}</option>
                                    </select>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">District</label>
                                    <select 
                                        v-if="storeLocationConfig.province_id"
                                        v-model="storeLocationConfig.district_id" 
                                        @change="onStoreDistrictChange"
                                        class="w-full h-10 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option :value="null" disabled>Select District</option>
                                        <option v-for="d in districts" :key="d.DistrictID" :value="d.DistrictID">{{ d.DistrictName }}</option>
                                    </select>
                                    <div v-else class="h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3 text-xs text-gray-400">Select province first</div>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ward</label>
                                    <select 
                                        v-if="storeLocationConfig.district_id"
                                        v-model="storeLocationConfig.ward_code"
                                        class="w-full h-10 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option :value="null" disabled>Select Ward</option>
                                        <option v-for="w in wards" :key="w.WardCode" :value="w.WardCode">{{ w.WardName }}</option>
                                    </select>
                                    <div v-else class="h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3 text-xs text-gray-400">Select district first</div>
                                </div>
                            </div>

                            <div class="space-y-1">
                                <label class="text-sm font-medium text-gray-700">Detailed Address (Street, Building)</label>
                                <textarea 
                                    v-model="storeLocationConfig.address"
                                    rows="2"
                                    class="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="42/41 Nguyễn Thái Học..."
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div v-if="message.text" :class="`p-3 rounded-lg text-sm font-medium mt-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`">
                            {{ message.text }}
                        </div>

                        <div class="flex justify-end pt-4 mt-auto">
                             <button 
                                type="submit" 
                                :disabled="isSaving"
                                class="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                            >
                                <Save v-if="!isSaving" class="w-4 h-4" />
                                <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {{ isSaving ? 'Saving...' : 'Save Location' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Coupon Modal -->
        <div v-if="showCouponModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                 <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                     <h3 class="text-xl font-bold text-gray-900">{{ currentCoupon.id ? 'Edit' : 'Create' }} Coupon</h3>
                     <button @click="showCouponModal = false" class="text-gray-400 hover:text-gray-600">×</button>
                 </div>
                 <div class="p-6 space-y-4">
                     <div>
                         <label class="block text-xs font-medium text-gray-700 mb-1">Coupon Code</label>
                         <input v-model="currentCoupon.code" type="text" class="w-full px-3 py-2 border rounded-lg uppercase" placeholder="e.g. SUMMER20">
                     </div>
                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <label class="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
                             <select v-model="currentCoupon.discount_type" class="w-full px-3 py-2 border rounded-lg">
                                 <option value="percentage">Percentage (%)</option>
                                 <option value="fixed">Fixed Amount (USD $)</option>
                             </select>
                         </div>
                         <div>
                             <label class="block text-xs font-medium text-gray-700 mb-1">Discount Value</label>
                             <input v-model="currentCoupon.discount_value" type="number" step="0.01" class="w-full px-3 py-2 border rounded-lg">
                         </div>
                     </div>
                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <label class="block text-xs font-medium text-gray-700 mb-1">Min. Purchase (USD $)</label>
                             <input v-model="currentCoupon.min_purchase_amount" type="number" step="0.01" class="w-full px-3 py-2 border rounded-lg">
                         </div>
                         <div>
                             <label class="block text-xs font-medium text-gray-700 mb-1">Usage Limit</label>
                             <input v-model="currentCoupon.usage_limit" type="number" placeholder="Unlimited" class="w-full px-3 py-2 border rounded-lg">
                         </div>
                     </div>
                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <label class="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                             <input v-model="currentCoupon.start_date" type="datetime-local" class="w-full px-3 py-2 border rounded-lg text-sm">
                         </div>
                         <div>
                             <label class="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                             <input v-model="currentCoupon.end_date" type="datetime-local" class="w-full px-3 py-2 border rounded-lg text-sm">
                         </div>
                     </div>
                 </div>
                 <div class="p-4 bg-gray-50 flex justify-end gap-3 border-t">
                     <button @click="showCouponModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                     <button @click="saveCoupon" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-all shadow-md">{{ currentCoupon.id ? 'Save Changes' : 'Create Coupon' }}</button>
                 </div>
            </div>
        </div>
    </div>
</template>
