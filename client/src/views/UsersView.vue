<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
    Search, 
    UserPlus, 
    Mail, 
    Phone, 
    Calendar, 
    Trash2, 
    Edit, 
    Filter,
    X,
    MapPin
} from 'lucide-vue-next';
import { useUsers, type User } from '../composables/useUsers';
import { useI18n } from '../composables/useI18n';
import { useGHN } from '../composables/useGHN';
import { useAuth } from '../composables/useAuth';

const { users, addUser, updateUser, deleteUser } = useUsers();
const { t } = useI18n();
const { provinces, districts, wards, fetchProvinces, fetchDistricts, fetchWards } = useGHN();
const { user: currentUser } = useAuth();

const searchQuery = ref('');
const roleFilter = ref('all');
const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const editingUser = ref<User | null>(null);
const userToDelete = ref<User | null>(null);
const confirmDeleteCheckbox = ref(false);
const error = ref('');
const isSubmitting = ref(false);

const form = ref<{
    name: string;
    email: string;
    role: User['role'];
    status: User['status'];
    phone: string;
    address: string;
    province_id: number | null;
    district_id: number | null;
    ward_code: string | null;
    password?: string;
}>({
    name: '',
    email: '',
    role: 'Customer',
    status: 'active',
    phone: '',
    address: '',
    province_id: null,
    district_id: null,
    ward_code: null,
    password: ''
});

onMounted(() => {
    fetchProvinces();
});

const onProvinceChange = () => {
    form.value.district_id = null;
    form.value.ward_code = null;
    if (form.value.province_id) {
        fetchDistricts(form.value.province_id);
    }
};

const onDistrictChange = () => {
    form.value.ward_code = null;
    if (form.value.district_id) {
        fetchWards(form.value.district_id);
    }
};

const filteredUsers = computed(() => {
    return users.value.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesRole = roleFilter.value === 'all' || user.role === roleFilter.value;
        return matchesSearch && matchesRole;
    });
});

const openAddModal = () => {
    editingUser.value = null;
    form.value = {
        name: '',
        email: '',
        role: 'Customer',
        status: 'active',
        phone: '',
        address: '',
        province_id: null,
        district_id: null,
        ward_code: null,
        password: ''
    };
    isModalOpen.value = true;
};

const openEditModal = async (user: User) => {
    editingUser.value = user;
    form.value = {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone || '',
        address: user.address || '',
        province_id: user.province_id || null,
        district_id: user.district_id || null,
        ward_code: user.ward_code || null,
        password: '' // Reset password field when editing
    };
    
    // Fetch corresponding locations for editing user
    if (user.province_id) {
        await fetchDistricts(user.province_id);
        if (user.district_id) {
            await fetchWards(user.district_id);
        }
    }
    
    isModalOpen.value = true;
};

const handleSubmit = async () => {
    error.value = '';
    isSubmitting.value = true;
    try {
        if (editingUser.value) {
            await updateUser(editingUser.value.id, form.value);
        } else {
            await addUser(form.value);
        }
        isModalOpen.value = false;
    } catch (err: any) {
        error.value = err.message || 'An error occurred while saving the user.';
    } finally {
        isSubmitting.value = false;
    }
};

const handleDelete = (user: User) => {
    userToDelete.value = user;
    confirmDeleteCheckbox.value = false;
    isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
    if (userToDelete.value && confirmDeleteCheckbox.value) {
        await deleteUser(userToDelete.value.id);
        isDeleteModalOpen.value = false;
        userToDelete.value = null;
    }
};

const getRoleBadgeColor = (role: string) => {
    const r = role.toLowerCase();
    switch (r) {
        case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
        // case 'baker': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'cashier': return 'bg-green-100 text-green-700 border-green-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};
</script>

<template>
    <div class="space-y-6">
        <!-- Header Actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold text-green-900">{{ t('users.userManagement') }}</h2>
                <p class="text-sm text-green-600">{{ t('users.manageStaff') }}</p>
            </div>
            <button 
                @click="openAddModal"
                class="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-md transition-all active:scale-95"
            >
                <UserPlus class="w-4 h-4" />
                {{ t('users.addNewUser') }}
            </button>
        </div>

        <!-- Filters & Search -->
        <div class="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex flex-col md:flex-row gap-4">
            <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    v-model="searchQuery"
                    type="text" 
                    :placeholder="t('users.searchPlaceholder')" 
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
            </div>
            <div class="flex items-center gap-2">
                <Filter class="w-4 h-4 text-green-600" />
                <select 
                    v-model="roleFilter"
                    class="border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                    <option value="all">{{ t('users.allRoles') }}</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <!-- <option value="Baker">Baker</option> -->
                    <option value="Cashier">Cashier</option>
                    <option value="Customer">Customer</option>
                </select>
            </div>
        </div>

        <!-- User Table -->
        <div class="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-green-50/50 text-green-900 border-b border-green-100 font-medium">
                        <tr>
                            <th class="px-6 py-4">{{ t('users.user') }}</th>
                            <th class="px-6 py-4">{{ t('users.role') }}</th>
                            <th class="px-6 py-4">{{ t('users.status') }}</th>
                            <th class="px-6 py-4">{{ t('users.contactInfo') }}</th>
                            <th class="px-6 py-4">{{ t('users.joinedDate') }}</th>
                            <th class="px-6 py-4 text-right">{{ t('common.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-green-50/30 transition-colors group">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-linear-to-br from-green-100 to-emerald-100 flex items-center justify-center text-green-700 font-bold uppercase border border-green-200">
                                        {{ user.name.charAt(0) }}
                                    </div>
                                    <div>
                                        <div class="font-bold text-gray-900">{{ user.name }}</div>
                                        <div class="text-xs text-gray-500 flex items-center gap-1">
                                            <Mail class="w-3 h-3" /> {{ user.email }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span :class="`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)} capitalize`">
                                    {{ user.role }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-1.5">
                                    <span :class="`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`"></span>
                                    <span class="capitalize font-medium" :class="user.status === 'active' ? 'text-green-700' : 'text-gray-500'">
                                        {{ user.status }}
                                    </span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="space-y-1 text-xs text-gray-600">
                                    <div v-if="user.phone" class="flex items-center gap-1 font-medium">
                                        <Phone class="w-3 h-3 text-green-600" /> {{ user.phone }}
                                    </div>
                                    <div v-else class="text-gray-400 italic">No phone</div>
                                    
                                    <div v-if="user.address" class="flex items-start gap-1 max-w-[220px] text-gray-500" :title="user.address">
                                        <MapPin class="w-3 h-3 mt-0.5 shrink-0 text-green-600" />
                                        <span class="truncate">{{ user.address }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-gray-600">
                                <div class="flex items-center gap-1.5 text-xs">
                                    <Calendar class="w-3 h-3" /> {{ user.joinDate }}
                                </div>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        @click="openEditModal(user)"
                                        class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit User"
                                    >
                                        <Edit class="w-4 h-4" />
                                    </button>
                                    <button 
                                        v-if="user.id !== currentUser?.id"
                                        @click="handleDelete(user)"
                                        class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        :title="t('common.delete')"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredUsers.length === 0">
                            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                                {{ t('users.noUsersFound') }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-green-100">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50/30">
                    <h2 class="text-xl font-bold text-green-900">
                        {{ editingUser ? t('users.editUser') : t('users.addNewUser') }}
                    </h2>
                    <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600">
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                    <div v-if="error" class="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                        {{ error }}
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ t('users.fullName') }}</label>
                            <input v-model="form.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        </div>
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ t('users.email') }}</label>
                            <input v-model="form.email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        </div>
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ t('users.role') }}</label>
                            <select 
                                v-model="form.role" 
                                :disabled="editingUser?.role === 'Admin'"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <!-- <option value="Baker">Baker</option> -->
                                <option value="Cashier">Cashier</option>
                                <option value="Customer">Customer</option>
                            </select>
                        </div>
                        <div v-if="!editingUser" class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ t('users.password') }}</label>
                            <input v-model="form.password" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        </div>
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ t('users.status') }}</label>
                            <select 
                                v-model="form.status" 
                                :disabled="editingUser?.id === currentUser?.id"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <p v-if="editingUser?.id === currentUser?.id" class="text-xs text-amber-600 mt-1 font-medium">
                                {{ t('users.cannotDisableSelf') }}
                            </p>
                        </div>
                    </div>

                    <div class="space-y-1">
                        <label class="text-sm font-medium text-gray-700">{{ t('users.phone') }}</label>
                        <input v-model="form.phone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                    </div>

                    <!-- GHN Address Fields -->
                    <div class="space-y-3 p-4 bg-green-50/20 border border-green-100 rounded-xl">
                        <label class="text-sm font-semibold text-green-900 flex items-center gap-1.5">
                            <MapPin class="w-4 h-4 text-green-600" />
                            Delivery Address (GHN Format)
                        </label>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div class="space-y-1">
                                <label class="text-xs font-medium text-gray-500">Province / City</label>
                                <select 
                                    v-model="form.province_id" 
                                    @change="onProvinceChange"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm"
                                >
                                    <option :value="null" disabled>Select Province</option>
                                    <option v-for="p in provinces" :key="p.ProvinceID" :value="p.ProvinceID">{{ p.ProvinceName }}</option>
                                </select>
                            </div>

                            <div class="space-y-1">
                                <label class="text-xs font-medium text-gray-500">District</label>
                                <select 
                                    v-model="form.district_id" 
                                    @change="onDistrictChange"
                                    :disabled="!form.province_id"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    <option :value="null" disabled>Select District</option>
                                    <option v-for="d in districts" :key="d.DistrictID" :value="d.DistrictID">{{ d.DistrictName }}</option>
                                </select>
                            </div>

                            <div class="space-y-1">
                                <label class="text-xs font-medium text-gray-500">Ward</label>
                                <select 
                                    v-model="form.ward_code"
                                    :disabled="!form.district_id"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    <option :value="null" disabled>Select Ward</option>
                                    <option v-for="w in wards" :key="w.WardCode" :value="w.WardCode">{{ w.WardName }}</option>
                                </select>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-xs font-medium text-gray-500">Detailed Address (Street, House Number)</label>
                            <input 
                                v-model="form.address" 
                                type="text"
                                placeholder="House No, Street name..."
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                            >
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button" @click="isModalOpen = false" :disabled="isSubmitting" class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
                            {{ t('common.cancel') }}
                        </button>
                        <button type="submit" :disabled="isSubmitting" class="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            {{ editingUser ? (isSubmitting ? t('users.updating') : t('users.editUser')) : (isSubmitting ? t('users.creating') : t('users.addNewUser')) }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div class="p-6 border-b border-red-100 bg-red-50">
                <h3 class="text-xl font-bold text-red-900 flex items-center gap-2">
                    <Trash2 class="w-5 h-5" />
                    {{ t('users.confirmDeletion') }}
                </h3>
            </div>
            
            <div class="p-6 space-y-4">
                <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p class="text-sm text-gray-600">You are about to delete the following account:</p>
                    <p class="font-bold text-gray-900 mt-1">{{ userToDelete?.name }}</p>
                    <p class="text-xs text-gray-500">{{ userToDelete?.email }}</p>
                </div>

                <p class="text-sm text-red-600 font-medium">
                    {{ t('users.deleteWarning') }}
                </p>

                <label class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                        v-model="confirmDeleteCheckbox"
                        type="checkbox" 
                        class="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    >
                    <span class="text-sm text-gray-700 select-none">
                        {{ t('users.understandPermanent') }}
                    </span>
                </label>
            </div>

            <div class="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                <button 
                    @click="isDeleteModalOpen = false"
                    class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {{ t('common.cancel') }}
                </button>
                <button 
                    @click="confirmDelete"
                    :disabled="!confirmDeleteCheckbox"
                    class="px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale active:scale-95"
                >
                    {{ t('users.deletePermanently') }}
                </button>
            </div>
        </div>
    </div>
</template>
```
