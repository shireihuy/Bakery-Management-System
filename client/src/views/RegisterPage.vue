<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Loader2, ArrowLeft, Phone, MapPin } from 'lucide-vue-next';

const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const phone = ref('');
const address = ref('');
const error = ref('');
const isLoading = ref(false);

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
    
    // Simulate API call
    setTimeout(() => {
        isLoading.value = false;
        // For now just log
        console.log('Register attempt', {
            name: name.value,
            email: email.value,
            password: password.value,
            phone: phone.value,
            address: address.value
        });
        // Navigate to dashboard on success (mocking success)
         router.push('/dashboard');
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
      
       <div class="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/95 rounded-xl border border-gray-200 shadow-sm my-8">
        <div class="flex flex-col space-y-1.5 p-6">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-xl overflow-hidden border-2 border-green-200 shadow-md">
              <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
            </div>
          </div>
          <div class="text-center">
            <h3 class="font-semibold tracking-tight text-2xl">Create Account</h3>
             <p class="text-sm text-muted-foreground text-gray-500">Join Matcha Bakery today</p>
          </div>
        </div>
        <div class="p-6 pt-0">
          <form @submit.prevent="handleSubmit" class="space-y-4">
             <div v-if="error" class="bg-red-50 text-red-900 border border-red-200 p-3 rounded-md text-sm">
                {{ error }}
            </div>

            <div class="space-y-2">
              <label for="name" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                v-model="name"
                required
                :disabled="isLoading"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
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
               <label for="phone" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phone Number</label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="123-456-7890"
                  v-model="phone"
                  :disabled="isLoading"
                  class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label for="address" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Address</label>
              <div class="relative">
                <MapPin class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                <input
                  id="address"
                  type="text"
                  placeholder="123 Main St, City, State"
                  v-model="address"
                  :disabled="isLoading"
                  class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
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

            <div class="space-y-2">
              <label for="confirmPassword" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                v-model="confirmPassword"
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
                   Creating account...
              </span>
              <span v-else>
                Create Account
              </span>
            </button>

            <div class="text-center text-sm">
              <span class="text-green-600">Already have an account? </span>
              <button
                type="button"
                @click="onToggleMode"
                class="text-green-900 hover:underline bg-transparent font-medium"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>
