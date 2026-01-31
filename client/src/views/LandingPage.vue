<script setup lang="ts">
import { useRouter } from 'vue-router';
import { 
  Coffee,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Languages,
  Heart,
  Award
} from "lucide-vue-next";

import { useAuth } from '../composables/useAuth';
import { useTheme } from '../composables/useTheme';
import { useI18n } from '../composables/useI18n';

const router = useRouter();
const { user } = useAuth();
const { isDark, toggleTheme } = useTheme();
const { t, locale, setLocale } = useI18n();

const onGetStarted = () => {
    if (user.value) {
        const role = user.value.role.toLowerCase();
        const staffRoles = ['admin', 'manager', 'baker', 'cashier'];
        if (staffRoles.includes(role)) {
            router.push('/dashboard');
        } else {
            router.push('/customer');
        }
    } else {
        router.push('/login');
    }
};

const onViewMenu = () => {
    if (user.value) {
        const role = user.value.role.toLowerCase();
        const staffRoles = ['admin', 'manager', 'baker', 'cashier'];
        if (staffRoles.includes(role)) {
            router.push('/products');
        } else {
            router.push('/customer');
        }
    } else {
        router.push('/customer');
    }
};

const features = [
    {
        icon: Sparkles,
        title: "Freshly Baked Daily",
        description: "All our products are baked fresh every morning using traditional methods."
    },
    {
        icon: Heart,
        title: "Made with Love",
        description: "Every item is handcrafted with care and passion by our skilled bakers."
    },
    {
        icon: Award,
        title: "Premium Quality",
        description: "We use only the finest organic flour and natural ingredients."
    },
    {
        icon: Coffee,
        title: "Matcha Specialties",
        description: "Our signature matcha-infused pastries are unique and delicious."
    }
];

const products = [
    { 
        name: "Matcha Croissant", 
        description: "Buttery, flaky croissant with premium matcha", 
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop",
        color: "from-emerald-400 to-green-500" 
    },
    { 
        name: "Artisan Sourdough", 
        description: "Crusty outside, soft inside, naturally fermented", 
        image: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?q=80&w=600&auto=format&fit=crop",
        color: "from-green-400 to-emerald-500" 
    },
    { 
        name: "Matcha Cheesecake", 
        description: "Creamy and rich with authentic Japanese matcha", 
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop",
        color: "from-lime-400 to-green-500" 
    },
    { 
        name: "Green Tea Cookies", 
        description: "Crispy, buttery cookies with matcha swirl", 
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=600&auto=format&fit=crop",
        color: "from-teal-400 to-cyan-500" 
    },
    { 
        name: "Whole Grain Bread", 
        description: "Healthy and hearty with seeds and grains", 
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop",
        color: "from-emerald-500 to-green-600" 
    }
];
</script>

<template>
    <div class="min-h-screen bg-accent-cream transition-colors duration-500">
      <!-- Header -->
      <header class="glass-header">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <router-link to="/" class="flex items-center gap-4 group no-transition-all font-sans relative z-10">
              <div class="w-12 h-12 rounded-xl overflow-hidden border-2 border-bakery-200 shadow-md transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500">
                <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
              </div>
              <div>
                <h1 class="text-bakery-900 font-bold text-xl tracking-tight leading-none mb-1">{{ t('bakeryName') }}</h1>
                <p class="text-[10px] text-bakery-500 dark:text-bakery-400 uppercase tracking-widest font-black opacity-70">{{ t('craftedWith') }}</p>
              </div>
            </router-link>
            
            <div class="flex items-center gap-4 sm:gap-6 relative z-10">
              <!-- Dark Mode Toggle -->
              <button 
                @click="toggleTheme" 
                class="p-2.5 rounded-xl bg-bakery-50 dark:bg-bakery-900/50 hover:bg-bakery-100 dark:hover:bg-bakery-800 text-bakery-600 dark:text-bakery-400 transition-all border border-bakery-100 dark:border-bakery-800"
                :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
              >
                <Sun v-if="isDark" class="w-5 h-5" />
                <Moon v-else class="w-5 h-5" />
              </button>

              <!-- Language Switcher -->
              <div class="relative group/lang">
                <button class="p-2.5 rounded-xl bg-bakery-50 dark:bg-bakery-900/50 hover:bg-bakery-100 dark:hover:bg-bakery-800 text-bakery-600 dark:text-bakery-400 transition-all border border-bakery-100 dark:border-bakery-800 flex items-center gap-2">
                  <Languages class="w-5 h-5" />
                  <span class="text-xs font-black uppercase tracking-widest hidden sm:inline">{{ locale }}</span>
                </button>
                <div class="absolute right-0 top-full mt-2 pt-2 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all">
                  <div class="glass-card rounded-2xl overflow-hidden min-w-[140px] border border-bakery-100 dark:border-bakery-800 bg-white/90 dark:bg-bakery-900/90 backdrop-blur-xl">
                    <button 
                      v-for="l in (['en', 'jp', 'vn'] as const)" 
                      :key="l"
                      @click="setLocale(l)" 
                      class="w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest hover:bg-bakery-50 dark:hover:bg-bakery-800 transition-colors flex items-center justify-between"
                      :class="{ 'text-bakery-600 dark:text-bakery-400 bg-bakery-50/50 dark:bg-bakery-800/50': locale === l, 'text-bakery-400 dark:text-bakery-600': locale !== l }"
                    >
                      <span>{{ l === 'en' ? 'English' : l === 'jp' ? '日本語' : 'Tiếng Việt' }}</span>
                      <div v-if="locale === l" class="w-1.5 h-1.5 rounded-full bg-bakery-600 animate-pulse"></div>
                    </button>
                  </div>
                </div>
              </div>

              <button 
                @click="onGetStarted"
                class="hidden sm:inline-flex items-center justify-center rounded-xl text-sm font-black h-11 px-6 bg-bakery-900 dark:bg-bakery-100 text-white dark:text-bakery-900 shadow-xl hover:shadow-bakery-900/20 dark:hover:shadow-white/10 transition-all active:scale-95"
              >
                {{ user ? t('getStarted') : t('login') }}
                <ArrowRight class="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
        <div class="container mx-auto px-6 relative z-10">
          <div class="max-w-4xl animate-[slide-in-up_1s_ease-out]">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bakery-50 dark:bg-bakery-900 border border-bakery-100 dark:border-bakery-800 text-bakery-600 dark:text-bakery-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
              <Sparkles class="w-3.5 h-3.5" />
              <span>{{ t('welcome') }} {{ t('bakeryName') }}</span>
            </div>
            <h1 class="text-6xl lg:text-9xl font-black text-bakery-900 dark:text-white tracking-tighter leading-[0.85] mb-10">
              {{ t('tagline') }}
            </h1>
            <p class="text-xl lg:text-2xl text-bakery-500 dark:text-bakery-400 font-medium leading-relaxed mb-14 max-w-2xl">
              {{ t('heroSub') }}
            </p>
            <div class="flex flex-col sm:flex-row gap-6">
              <button 
                @click="onGetStarted"
                class="h-16 px-12 rounded-2xl bg-bakery-900 dark:bg-white text-white dark:text-bakery-900 font-black text-lg hover:scale-105 transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3"
              >
                {{ t('getStarted') }}
                <ArrowRight class="w-5 h-5" />
              </button>
              <button 
                @click="onViewMenu"
                class="h-16 px-12 rounded-2xl glass-card text-bakery-900 dark:text-white font-black text-lg hover:bg-white/50 dark:hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center border border-bakery-200 dark:border-bakery-800"
              >
                {{ t('viewMenu') }}
              </button>
            </div>
          </div>
        </div>
        <!-- Decorative Background -->
        <div class="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-full opacity-10 dark:opacity-20 blur-3xl rounded-full bg-bakery-600 -mr-[20%] pointer-events-none"></div>
      </section>

      <!-- Signature Grid -->
      <section class="bg-white dark:bg-bakery-950 py-32 border-y border-bakery-50 dark:border-bakery-900 relative">
        <div class="container mx-auto px-6 text-center mb-20 space-y-6">
            <h2 class="text-5xl lg:text-6xl font-black text-bakery-900 dark:text-white tracking-tight">{{ t('signatureSelection') }}</h2>
            <p class="text-bakery-500 dark:text-bakery-400 max-w-2xl mx-auto text-xl font-medium">{{ t('signatureSub') }}</p>
        </div>
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
                <div v-for="(signatureProduct, index) in products" :key="index" class="glass-card p-0 rounded-[3rem] text-center hover:-translate-y-4 transition-all duration-500 group border border-bakery-50 dark:border-bakery-900 hover:shadow-2xl hover:shadow-bakery-500/10 overflow-hidden">
                    <div class="h-64 relative overflow-hidden">
                         <img :src="signatureProduct.image" :alt="signatureProduct.name" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                         <div class="absolute inset-0 bg-gradient-to-t from-bakery-900/60 to-transparent"></div>
                    </div>
                    <div class="p-8">
                        <h3 class="text-bakery-900 dark:text-white font-black text-xl mb-3">{{ signatureProduct.name }}</h3>
                        <p class="text-bakery-500 dark:text-bakery-400 text-sm font-medium leading-relaxed">{{ signatureProduct.description }}</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <!-- Philosophy & Features -->
      <section class="bg-accent-cream py-40 overflow-hidden relative">
        <div class="container mx-auto px-6 relative z-10">
          <div class="grid lg:grid-cols-2 gap-24 items-center">
            <div class="space-y-16">
              <div class="space-y-8">
                <div class="flex items-center gap-4">
                  <div class="h-px w-12 bg-bakery-600"></div>
                  <h3 class="text-bakery-600 dark:text-bakery-400 font-black uppercase tracking-[0.3em] text-xs">{{ t('philosophy') }}</h3>
                </div>
                <h2 class="text-6xl lg:text-8xl font-black text-bakery-900 dark:text-white tracking-tighter leading-[0.9]">
                  {{ t('ingredientsTitle') }}
                </h2>
                <p class="text-2xl text-bakery-500 dark:text-bakery-400 font-medium leading-relaxed max-w-xl">
                  {{ t('ingredientsSub') }}
                </p>
              </div>
              <div class="grid sm:grid-cols-2 gap-10">
                <div v-for="(feature, index) in features" :key="index" class="space-y-6 group">
                  <div class="w-14 h-14 rounded-2xl bg-bakery-900 dark:bg-bakery-100 text-white dark:text-bakery-900 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <component :is="feature.icon" class="w-7 h-7" />
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-bakery-900 dark:text-white font-black text-xl">{{ feature.title }}</h3>
                    <p class="text-bakery-500 dark:text-bakery-400 text-base font-medium leading-relaxed">{{ feature.description }}</p>
                  </div>
                </div>
              </div>
              <button @click="onViewMenu" class="group flex items-center gap-6 text-bakery-900 dark:text-white font-black text-2xl hover:gap-8 transition-all">
                <span class="border-b-4 border-bakery-600 pb-1">{{ t('exploreMenu') }}</span>
                <ArrowRight class="w-8 h-8 text-bakery-600" />
              </button>
            </div>
            <div class="relative lg:-mr-20">
              <div class="aspect-[4/5] rounded-[5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.15)] rotate-3 hover:rotate-0 transition-transform duration-1000 border-[12px] border-white dark:border-bakery-900">
                 <img src="https://images.unsplash.com/photo-1515823662273-ad951e77d700?q=80&w=2070&auto=format&fit=crop" alt="Baking Process" class="w-full h-full object-cover" />
              </div>
              <div class="absolute -bottom-16 -left-16 glass-card p-12 rounded-[4rem] animate-float shadow-2xl border border-bakery-100 dark:border-bakery-800">
                <p class="text-6xl font-black text-bakery-900 dark:text-white mb-2 tracking-tighter">100%</p>
                <p class="text-bakery-600 dark:text-bakery-400 font-black uppercase tracking-[0.2em] text-[10px]">Organic Japanese Matcha</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="container mx-auto px-6 py-20 animate-in zoom-in duration-700">
        <div class="bg-bakery-900 dark:bg-bakery-950 rounded-[5rem] p-16 lg:p-32 text-center space-y-12 relative overflow-hidden group border border-white/5">
          <div class="absolute inset-0 bg-gradient-to-tr from-bakery-800/50 to-transparent opacity-50"></div>
          <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-bakery-600/10 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div class="relative z-10 space-y-8">
            <h2 class="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none max-w-4xl mx-auto">
              {{ t('readyToTaste') }}
            </h2>
            <p class="text-bakery-200/80 text-xl lg:text-3xl font-medium max-w-3xl mx-auto leading-relaxed">
              {{ t('visitUs') }}
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-8 pt-10">
              <button 
                @click="onGetStarted"               
                class="h-20 px-16 rounded-[2rem] bg-white text-bakery-900 font-black text-2xl hover:scale-105 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4"
              >
                {{ t('orderNow') }}
                <ArrowRight class="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="pt-40 pb-20 border-t border-bakery-100 dark:border-bakery-900 relative">
        <div class="container mx-auto px-6">
          <div class="grid lg:grid-cols-4 gap-20 mb-32">
            <div class="lg:col-span-2 space-y-12">
              <div class="flex items-center gap-6">
                <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-bakery-100 dark:border-bakery-800 shadow-xl">
                   <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
                </div>
                <div class="space-y-1">
                  <h3 class="text-bakery-900 dark:text-white font-black text-3xl tracking-tighter">{{ t('bakeryName') }}</h3>
                  <p class="text-bakery-500 dark:text-bakery-400 font-black uppercase tracking-[0.2em] text-[10px]">Artisan Mastery</p>
                </div>
              </div>
              <p class="text-bakery-500 dark:text-bakery-400 text-xl font-medium leading-relaxed max-w-sm">
                {{ t('heroSub') }}
              </p>
            </div>
            <div>
              <h4 class="text-bakery-900 dark:text-white font-black uppercase tracking-[0.2em] text-xs mb-10 opacity-50">Discovery</h4>
              <ul class="space-y-6">
                <li><button @click="onGetStarted" class="text-bakery-500 dark:text-bakery-400 hover:text-bakery-900 dark:hover:text-white font-black text-lg transition-colors">{{ t('getStarted') }}</button></li>
                <li><button @click="onViewMenu" class="text-bakery-500 dark:text-bakery-400 hover:text-bakery-900 dark:hover:text-white font-black text-lg transition-colors">{{ t('viewMenu') }}</button></li>
              </ul>
            </div>
            <div>
              <h4 class="text-bakery-900 dark:text-white font-black uppercase tracking-[0.2em] text-xs mb-10 opacity-50">Presence</h4>
              <p class="text-bakery-900 dark:text-white font-black text-lg mb-4">hello@matchabakery.com</p>
              <p class="text-bakery-500 dark:text-bakery-400 font-bold">+1 (555) 000-0000</p>
            </div>
          </div>
          <div class="pt-16 border-t border-bakery-100 dark:border-bakery-900 flex flex-col md:flex-row justify-between items-center gap-10">
            <p class="text-bakery-400 font-black text-sm uppercase tracking-widest">© 2024 {{ t('bakeryName') }}. {{ t('est') }}.</p>
            <div class="flex items-center gap-10 text-bakery-400 font-black text-sm uppercase tracking-widest">
              <span>{{ t('craftedWith') }}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
</template>

<style scoped>
@keyframes slide-in-up {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}
</style>
