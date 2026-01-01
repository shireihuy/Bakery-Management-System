<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Loader2, ArrowLeft } from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { login } = useAuth();

const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const onToggleMode = () => {
    router.push('/register');
};

const onBackToHome = () => {
    router.push('/');
};

const handleSubmit = async () => {
    error.value = '';
    isLoading.value = true;
    
    // Simulate API call and login
    setTimeout(() => {
        isLoading.value = false;
        const redirectPath = login(email.value);
        console.log('Logged in as:', email.value);
        router.push(redirectPath);
    }, 1000);
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>
      
      <!-- Back to Home Button -->
      <button
        @click="onBackToHome"
        class="absolute top-6 left-6 z-20 text-green-700 hover:text-green-900 hover:bg-green-100 bg-transparent flex items-center px-4 py-2 rounded-md transition-colors"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Home
      </button>
      
      <div class="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/95 rounded-xl border border-gray-200 shadow-sm">
        <div class="flex flex-col space-y-1.5 p-6">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-xl overflow-hidden border-2 border-green-200 shadow-md">
              <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
            </div>
          </div>
          <div class="text-center">
            <h3 class="font-semibold tracking-tight text-2xl">Welcome Back</h3>
            <p class="text-sm text-muted-foreground text-gray-500">Sign in to your Matcha Bakery account</p>
          </div>
        </div>
        <div class="p-6 pt-0">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div v-if="error" class="bg-red-50 text-red-900 border border-red-200 p-3 rounded-md text-sm">
                {{ error }}
            </div>

            <div class="space-y-2">
              <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                v-model="email"
                required
                :disabled="isLoading"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div class="space-y-2">
              <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                v-model="password"
                required
                :disabled="isLoading"
                 class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="flex items-center">
                   <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                   Signing in...
              </span>
              <span v-else>
                Sign In
              </span>
            </button>

            <div class="text-center text-sm">
              <span class="text-green-600">Don't have an account? </span>
              <button
                type="button"
                @click="onToggleMode"
                class="text-green-900 hover:underline bg-transparent font-medium"
              >
                Register
              </button>
            </div>
          </form>

          <div class="mt-6 pt-6 border-t border-green-200">
            <p class="text-sm text-green-600 mb-3">Demo accounts:</p>
            <div class="space-y-1 text-xs text-green-700">
              <p>Admin: admin@bakery.com / admin123</p>
              <p>Manager: manager@bakery.com / manager123</p>
              <p>Baker: baker@bakery.com / baker123</p>
              <p>Cashier: cashier@bakery.com / cashier123</p>
              <p>Customer: customer@bakery.com / customer123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
