<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Loader2, ArrowLeft } from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';
import { useI18n } from '../composables/useI18n';
import SimpleCaptcha from '../components/SimpleCaptcha.vue';

const router = useRouter();
const { login } = useAuth();
const { t } = useI18n();

const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);
const isCaptchaVerified = ref(false);

const onCaptchaVerify = (status: boolean) => {
    isCaptchaVerified.value = status;
};

const onToggleMode = () => {
    router.push('/register');
};

const onBackToHome = () => {
    router.push('/');
};

const handleSubmit = async () => {
    error.value = '';
    isLoading.value = true;
    
    if (!isCaptchaVerified.value) {
        error.value = t('auth.captchaRequired');
        isLoading.value = false;
        return;
    }
    
    try {
        const redirectPath = await login(email.value, password.value);
        console.log('Logged in as:', email.value);
        router.push(redirectPath);
    } catch (err: any) {
        error.value = err.message || 'Login failed. Please check your credentials.';
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
        <span class="text-sm uppercase tracking-widest">{{ t('common.back') }}</span>
      </button>
      
      <div class="w-full max-w-md relative z-10 glass-card rounded-[3rem] p-4 animate-in zoom-in duration-500">
        <div class="p-8 sm:p-10 space-y-10">
          <div class="text-center space-y-4">
            <div class="inline-block relative">
                <div class="w-24 h-24 mx-auto rounded-3xl overflow-hidden border-4 border-white shadow-2xl transform -rotate-6 transition-transform hover:rotate-0 duration-500">
                  <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
                </div>
                <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-bakery-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <Sparkles class="w-4 h-4 text-white" />
                </div>
            </div>
            <div>
                <h3 class="font-black text-3xl text-bakery-900 tracking-tight">{{ t('auth.welcomeBack') }}</h3>
                <p class="text-bakery-500 font-medium">Please sign in to your dashboard</p>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div v-if="error" class="bg-red-50 text-red-900 border border-red-100 p-4 rounded-2xl text-sm font-medium animate-in slide-in-from-top-2">
                {{ error }}
            </div>

            <div class="space-y-2">
              <label for="email" class="text-xs font-black text-bakery-400 uppercase tracking-widest ml-1">{{ t('auth.email') }}</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                v-model="email"
                required
                :disabled="isLoading"
                class="flex h-14 w-full rounded-2xl border border-bakery-100 bg-white/50 px-5 py-2 text-base font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-bakery-500/10 focus:border-bakery-500 disabled:opacity-50"
              />
            </div>

            <div class="space-y-2">
              <label for="password" class="text-xs font-black text-bakery-400 uppercase tracking-widest ml-1">{{ t('auth.password') }}</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                v-model="password"
                required
                :disabled="isLoading"
                 class="flex h-14 w-full rounded-2xl border border-bakery-100 bg-white/50 px-5 py-2 text-base font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-bakery-500/10 focus:border-bakery-500 disabled:opacity-50"
              />
            </div>
            
            <SimpleCaptcha @verify="onCaptchaVerify" />

            <button
              type="submit"
              class="h-14 w-full rounded-2xl bg-bakery-900 hover:bg-bakery-800 text-white font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-bakery-900/10 flex items-center justify-center gap-3"
              :disabled="isLoading"
            >
              <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span>{{ isLoading ? t('common.loading') : t('auth.signIn') }}</span>
            </button>

            <div class="text-center pt-2">
              <span class="text-bakery-500 font-medium tracking-tight">{{ t('auth.noAccount') }} </span>
              <button
                type="button"
                @click="onToggleMode"
                class="text-bakery-900 hover:text-bakery-600 font-black tracking-tight"
              >
                {{ t('auth.signUp') }}
              </button>
            </div>
          </form>

          <div class="pt-8 border-t border-bakery-50">
            <div class="flex items-center gap-2 mb-4">
                <div class="h-px flex-1 bg-bakery-50"></div>
                <p class="text-[10px] font-black text-bakery-300 uppercase tracking-widest">Demo Credentials</p>
                <div class="h-px flex-1 bg-bakery-50"></div>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-bakery-400 font-bold">
              <p>Admin: admin@bakery.com</p>
              <p>Pass: adminpassword</p>
              <p>User: john@example.com</p>
              <p>Pass: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>

</template>
