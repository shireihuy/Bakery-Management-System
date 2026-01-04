<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { User, Save, Bell, Shield, Key } from 'lucide-vue-next';

const { user, updateProfile } = useAuth();

const formData = ref({
    name: '',
    email: '',
    phone: '',
    address: ''
});

const isSaving = ref(false);
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
        
        message.value = { text: 'Profile updated successfully!', type: 'success' };
    } catch (error) {
        message.value = { text: 'Failed to update profile.', type: 'error' };
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
                    Account Settings
                </h2>
                <p class="text-sm text-green-600 mt-1">Manage your personal information and preferences</p>
            </div>
            
            <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Sidebar / Navigation for Settings (Visual only for now) -->
                <div class="space-y-2">
                    <button class="w-full flex items-center gap-3 px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg border border-green-200">
                        <User class="w-4 h-4" />
                        Profile
                    </button>
                    <button class="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Bell class="w-4 h-4" />
                        Notifications
                    </button>
                    <button class="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Shield class="w-4 h-4" />
                        Security
                    </button>
                </div>

                <!-- Main Form -->
                <div class="md:col-span-2 space-y-6">
                    <form @submit.prevent="handleSave" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="text-sm font-medium text-gray-700">Full Name</label>
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
                                <label class="text-sm font-medium text-gray-700">Email Address</label>
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
                                <label class="text-sm font-medium text-gray-700">Phone Number</label>
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
                                <label class="text-sm font-medium text-gray-700">Role</label>
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
                            <label class="text-sm font-medium text-gray-700">Address</label>
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
                                class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <Save v-if="!isSaving" class="w-4 h-4" />
                                <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {{ isSaving ? 'Saving...' : 'Save Changes' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
