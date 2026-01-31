<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Loader2, ArrowLeft, Phone, MapPin } from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';

const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const phone = ref('');
const address = ref('');
const error = ref('');
const isLoading = ref(false);

const { register, login } = useAuth();

const onToggleMode = () => {
    router.push('/login');
};

const onBackToHome = () => {
    router.push('/');
};

const handleSubmit = async () => {
    error.value = '';

    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match';
      return;
    }

    if (password.value.length < 6) {
      error.value = 'Password must be at least 6 characters';
      return;
    }

    isLoading.value = true;
    
    try {
        await register({
            name: name.value,
            email: email.value,
            password: password.value,
            phone_number: phone.value,
            address: address.value,
            role: 'Customer' // Default to customer on public registration
        });
        
        // Auto login after registration
        const redirectPath = await login(email.value, password.value);
        router.push(redirectPath);
    } catch (err: any) {
        error.value = err.message || 'Registration failed. Please try again.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen bg-accent-cream flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Decorative Elements -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-bakery-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-bakery-300/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
      </div>
      
      <!-- Back to Home -->
      <button
        @click="onBackToHome"
        class="absolute top-8 left-8 z-20 text-bakery-900 font-bold flex items-center gap-2 px-6 py-3 rounded-2xl glass-card transition-all active:scale-95"
      >
        <ArrowLeft class="w-4 h-4" />
        <span class="text-sm uppercase tracking-widest">Back to Home</span>
      </button>
      
      <div class="w-full max-w-lg relative z-10 glass-card rounded-[3rem] p-4 animate-in zoom-in duration-500 my-12">
        <div class="p-8 sm:p-10 space-y-10">
          <div class="text-center space-y-4">
            <div class="w-20 h-20 mx-auto rounded-3xl overflow-hidden border-4 border-white shadow-2xl transform rotate-3 transition-transform hover:rotate-0 duration-500">
              <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
            </div>
            <div>
                <h3 class="font-black text-3xl text-bakery-900 tracking-tight">Join the Family</h3>
                <p class="text-bakery-500 font-medium tracking-tight">Register for exclusive access and rewards</p>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div v-if="error" class="bg-red-50 text-red-900 border border-red-100 p-4 rounded-2xl text-sm font-medium animate-in slide-in-from-top-2">
                {{ error }}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Left Column -->
                <div class="space-y-6">
                    <div class="space-y-2">
                      <label for="name" class="text-[10px] font-black text-bakery-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        v-model="name"
                        required
                        :disabled="isLoading"
                        class="flex h-12 w-full rounded-2xl border border-bakery-100 bg-white/50 px-5 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-bakery-500/10 focus:border-bakery-500 disabled:opacity-50"
                      />
                    </div>

                    <div class="space-y-2">
                      <label for="email" class="text-[10px] font-black text-bakery-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        v-model="email"
                        required
                        :disabled="isLoading"
                        class="flex h-12 w-full rounded-2xl border border-bakery-100 bg-white/50 px-5 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-bakery-500/10 focus:border-bakery-500 disabled:opacity-50"
                      />
                    </div>

                    <div class="space-y-2">
                      <label for="phone" class="text-[10px] font-black text-bakery-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div class="relative group">
                        <Phone class="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-bakery-300 group-focus-within:text-bakery-500 transition-colors" />
                        <input
                          id="phone"
                          type="tel"
                          placeholder="123-456-7890"
                          v-model="phone"
                          :disabled="isLoading"
                          class="flex h-12 w-full rounded-2xl border border-bakery-100 bg-white/50 px-12 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-bakery-500/10 focus:border-bakery-500 disabled:opacity-50"
                        />
                      </div>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-6">
                    <div class="space-y-2">
                      <label for="address" class="text-[10px] font-black text-bakery-400 uppercase tracking-widest ml-1">Delivery Address</label>
                      <div class="relative group">
                        <MapPin class="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-bakery-300 group-focus-within:text-bakery-500 transition-colors" />
                        <input
                          id="address"
                          type="text"
                          placeholder="123 Main St..."
                          v-model="address"
                          :disabled="isLoading"
                          class="flex h-12 w-full rounded-2xl border border-bakery-100 bg-white/50 px-12 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-bakery-500/10 focus:border-bakery-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div class="space-y-2">
                      <label for="password" class="text-[10px] font-black text-bakery-400 uppercase tracking-widest ml-1">Create Password</label>
                      <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        v-model="password"
                        required
                        :disabled="isLoading"
                        class="flex h-12 w-full rounded-2xl border border-bakery-100 bg-white/50 px-5 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-bakery-500/10 focus:border-bakery-500 disabled:opacity-50"
                      />
                    </div>

                    <div class="space-y-2">
                      <label for="confirmPassword" class="text-[10px] font-black text-bakery-400 uppercase tracking-widest ml-1">Confirm Password</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        v-model="confirmPassword"
                        required
                        :disabled="isLoading"
                        class="flex h-12 w-full rounded-2xl border border-bakery-100 bg-white/50 px-5 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-bakery-500/10 focus:border-bakery-500 disabled:opacity-50"
                      />
                    </div>
                </div>
            </div>

            <button
              type="submit"
              class="h-14 w-full rounded-2xl bg-bakery-900 hover:bg-bakery-800 text-white font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-bakery-900/10 flex items-center justify-center gap-3 mt-4"
              :disabled="isLoading"
            >
              <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span>{{ isLoading ? 'Creating account...' : 'Create Account' }}</span>
            </button>

            <div class="text-center pt-2">
              <span class="text-bakery-500 font-medium tracking-tight">Already have an account? </span>
              <button
                type="button"
                @click="onToggleMode"
                class="text-bakery-900 hover:text-bakery-600 font-black tracking-tight"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

</template>
