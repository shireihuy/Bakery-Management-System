<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ShoppingCart, 
  Coffee,
  Heart, 
  Clock, 
  Award,
  MapPin,
  ArrowRight,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-vue-next";

import { useAuth } from '../composables/useAuth';
import { useProducts } from '../composables/useProducts';
import { useI18n } from '../composables/useI18n';
import { useCurrency } from '../composables/useCurrency';

const router = useRouter();
const { user } = useAuth();
const { t } = useI18n();
const { formatPrice } = useCurrency();

const onGetStarted = () => {
    if (user.value) {
        // Redirect based on role
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

const { products: dbProducts, fetchProducts } = useProducts();

const menuProducts = computed(() => {
    return dbProducts.value.length > 0 ? dbProducts.value : [];
});


const currentSlide = ref(0);
const slidesToShow = ref(4);
const isTransitioning = ref(true);

const handleResize = () => {
    if (window.innerWidth < 640) {
    slidesToShow.value = 1;
    } else if (window.innerWidth < 1024) {
    slidesToShow.value = 2;
    } else if (window.innerWidth < 1280) {
    slidesToShow.value = 3;
    } else {
    slidesToShow.value = 4;
    }
};

const isScrolled = ref(false);

const handleScroll = () => {
    isScrolled.value = window.scrollY > 20;
};

const storeLocation = ref('');

const loadStoreInfo = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/system/settings`);
        if (response.ok) {
            const settings = await response.json();
            if (settings.store_location_config && settings.store_location_config.address) {
                storeLocation.value = settings.store_location_config.address;
            }
        }
    } catch {
       // Ignore, fallback to default translation
    }
};

onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    fetchProducts();
    loadStoreInfo();
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll);
});

// Auto-rotate carousel
let timer: ReturnType<typeof setInterval>;
onMounted(() => {
    timer = setInterval(() => {
        nextSlide();
    }, 3500);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});


const nextSlide = () => {
    if (!isTransitioning.value) return;
    
    currentSlide.value++;
    
    if (currentSlide.value === menuProducts.value.length) {
        setTimeout(() => {
            isTransitioning.value = false;
            currentSlide.value = 0;
            setTimeout(() => {
                isTransitioning.value = true;
            }, 50);
        }, 500);
    }
};

const prevSlide = () => {
    if (!isTransitioning.value) return;

    if (currentSlide.value === 0) {
        isTransitioning.value = false;
        currentSlide.value = menuProducts.value.length;
        setTimeout(() => {
            isTransitioning.value = true;
            currentSlide.value--;
        }, 50);
    } else {
        currentSlide.value--;
    }
};

const goToSlide = (index: number) => {
    isTransitioning.value = true;
    currentSlide.value = index;
};

const displayProducts = computed(() => {
    return [...menuProducts.value, ...menuProducts.value.slice(0, slidesToShow.value)];
});

const totalDots = computed(() => {
    return menuProducts.value.length;
});

const features = computed(() => [
    {
        icon: Sparkles,
        title: "Freshly Baked Daily",
        description: "All our products are baked fresh every morning using traditional methods and premium ingredients."
    },
    {
        icon: Heart,
        title: "Made with Love",
        description: "Every item is handcrafted with care and passion by our skilled bakers who love what they do."
    },
    {
        icon: Award,
        title: "Premium Quality",
        description: "We use only the finest organic flour, natural ingredients, and authentic matcha powder."
    },
    {
        icon: Coffee,
        title: "Matcha Specialties",
        description: "Our signature matcha-infused pastries and breads are unique and absolutely delicious."
    }
]);


const signatureProducts = [
    {
        name: "Matcha Croissant",
        description: "Buttery, flaky croissant with premium matcha",
        color: "from-emerald-400 to-green-500"
    },
    {
        name: "Artisan Sourdough",
        description: "Crusty outside, soft inside, naturally fermented",
        color: "from-green-400 to-emerald-500"
    },
    {
        name: "Matcha Cheesecake",
        description: "Creamy and rich with authentic Japanese matcha",
        color: "from-lime-400 to-green-500"
    },
    {
        name: "Green Tea Cookies",
        description: "Crispy, buttery cookies with matcha swirl",
        color: "from-teal-400 to-cyan-500"
    },
    {
        name: "Whole Grain Bread",
        description: "Healthy and hearty with seeds and grains",
        color: "from-emerald-500 to-green-600"
    }
];

const mapUrl = computed(() => {
    const address = storeLocation.value || t('landing.locationTitle') || 'Vietnam';
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
});

</script>

<template>
    <div class="min-h-screen bg-accent-cream overflow-x-hidden pt-20 sm:pt-24">
      <!-- Header -->
      <header 
        class="glass-header w-full flex-none transition-all duration-500"
        :class="{ 'py-2 shadow-2xl bg-white/95': isScrolled, 'py-4': !isScrolled }"
      >
        <div class="container mx-auto px-6">
          <div class="flex items-center justify-between">
            <router-link to="/" class="flex items-center gap-4 group no-transition-all">
              <div class="w-12 h-12 rounded-xl overflow-hidden border-2 border-bakery-200 shadow-md transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500">
                <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
              </div>
              <div>
                <h1 class="text-bakery-900 font-bold text-xl tracking-tight">The Artisan <span class="text-bakery-600">Bakery</span></h1>
                <p class="text-[10px] text-bakery-500 uppercase tracking-[0.2em] font-black">Fresh • Organic • Daily</p>
              </div>
            </router-link>
            <div class="flex items-center gap-4">
              <button 
                @click="onGetStarted"
                class="inline-flex items-center justify-center rounded-xl text-sm font-semibold h-11 px-6 bg-bakery-900 hover:bg-bakery-800 text-white shadow-lg transition-all active:scale-95"
              >
                {{ user ? t('landing.enterShop') : t('nav.login') }}
                <ArrowRight class="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </header>


      <!-- Carousel Section -->
       <section v-if="menuProducts.length > 0" class="bg-white border-b border-bakery-50 py-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-12">
            <h2 class="text-4xl text-bakery-900 mb-2 font-black tracking-tight">
              {{ t('landing.featuredProducts') }}
            </h2>
            <div class="w-12 h-1 bg-bakery-600 mx-auto rounded-full"></div>
          </div>
           
           <div class="relative group">
                <div class="overflow-hidden p-4">
                    <div 
                        class="flex" 
                        :class="{ 'transition-transform duration-500 ease-in-out': isTransitioning }"
                        :style="{ transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)` }"
                    >
                        <div 
                            v-for="(product, idx) in displayProducts" 
                            :key="`${product.id}-${idx}`" 
                            class="shrink-0 px-4"
                            :style="{ width: `${100 / slidesToShow}%` }"
                        >
                            <div class="bg-white rounded-3xl lg:rounded-[2.5rem] overflow-hidden border border-bakery-50 hover:border-bakery-200 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] h-full flex flex-col group/card">
                                <div class="relative h-64 lg:h-72 overflow-hidden">
                                    <img
                                        :src="product.image"
                                        :alt="product.name"
                                        class="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                                    />
                                    <div class="absolute top-4 right-4 bg-bakery-900/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        {{product.category}}
                                    </div>
                                    <div v-if="product.rating" class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                        <Star class="w-3.5 h-3.5 fill-accent-gold text-accent-gold" />
                                        <span class="text-xs text-bakery-900 font-black">{{product.rating}}</span>
                                    </div>
                                </div>
                                <div class="p-5 lg:p-6 flex-1 flex flex-col">
                                    <h3 class="text-bakery-900 mb-2 font-black text-lg">{{product.name}}</h3>
                                    <p class="text-xs lg:text-sm text-bakery-500 mb-6 font-medium line-clamp-2">{{product.description}}</p>
                                    <div class="flex items-center justify-between mt-auto">
                                        <div class="flex flex-col">
                                            <span class="text-xl lg:text-2xl text-bakery-900 font-black">
                                                {{ formatPrice(product.price) }}
                                            </span>
                                            <span class="text-[10px] text-bakery-400 font-bold uppercase tracking-widest">{{ product.stock }} {{ t('inventory.unit') || 'left' }}</span>
                                        </div>
                                        <button
                                            @click="onGetStarted"
                                            class="shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-bakery-50 flex items-center justify-center text-bakery-900 group-hover/card:bg-bakery-900 group-hover/card:text-white transition-all duration-300 shadow-sm"
                                        >
                                            <ArrowRight class="w-4 h-4 lg:w-5 lg:h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Controls -->
                <button 
                    @click="prevSlide"
                    class="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-14 h-14 rounded-full bg-white shadow-2xl border border-bakery-50 items-center justify-center text-bakery-900 hover:bg-bakery-900 hover:text-white transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0 z-10"
                >
                    <ChevronLeft class="w-6 h-6" />
                </button>
                <button 
                    @click="nextSlide"
                    class="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-14 h-14 rounded-full bg-white shadow-2xl border border-bakery-50 items-center justify-center text-bakery-900 hover:bg-bakery-900 hover:text-white transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0 z-10"
                >
                    <ChevronRight class="w-6 h-6" />
                </button>

                <!-- Pagination Dots -->
                <div v-if="totalDots > 1" class="flex justify-center mt-12 gap-3">
                    <button 
                        v-for="(_, index) in totalDots" 
                        :key="index"
                        @click="goToSlide(index)"
                        :class="[currentSlide === index ? 'bg-bakery-900 w-10' : 'bg-bakery-100 w-3 hover:bg-bakery-200']"
                        class="h-1.5 rounded-full transition-all duration-500"
                    ></button>
                </div>
           </div>
        </div>
       </section>
      
      <!-- Hero Section -->
      <section class="container mx-auto px-6 py-24 lg:py-40">
        <div class="grid lg:grid-cols-2 gap-20 items-center">
          <div class="space-y-10 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div class="inline-block">
              <span class="bg-bakery-900 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                🍃 {{ t('nav.about') }}
              </span>
            </div>
            <h1 class="text-5xl lg:text-8xl text-bakery-900 leading-[0.95] font-black tracking-tighter">
              {{ t('landing.heroTitle').split(',')[0] }} <br/>
              <span class="text-transparent bg-clip-text bg-linear-to-r from-bakery-600 to-bakery-400">
                {{ t('landing.heroTitle').split(',')[1] || 'Crafted Daily' }}
              </span>
            </h1>
            <p class="text-xl text-bakery-500 leading-relaxed max-w-xl font-medium mx-auto lg:mx-0">
              {{ t('landing.heroSubtitle') }}
            </p>
            <div class="flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 pt-6">
              <button 
                @click="onGetStarted"
                class="inline-flex items-center justify-center rounded-3xl text-lg font-black h-16 px-10 lg:px-12 bg-bakery-900 hover:bg-bakery-950 text-white shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
              >
                {{ t('landing.enterShop') }}
                <ShoppingCart class="w-6 h-6 ml-3" />
              </button>
              <button 
                @click="onViewMenu"
                class="inline-flex items-center justify-center rounded-3xl text-lg font-black h-16 px-10 lg:px-12 border-2 border-bakery-100 text-bakery-900 hover:bg-bakery-50 transition-all"
              >
                {{ t('landing.viewMenu') }}
              </button>
            </div>
          </div>
          <div class="relative">
            <div class="absolute -inset-4 lg:-inset-10 bg-bakery-200/30 rounded-[5rem] blur-3xl animate-pulse"></div>
            <div class="relative rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 lg:border-12 border-white group">
              <img 
                src="https://images.unsplash.com/photo-1592637970552-6c27432e7913?auto=format&fit=crop&q=80&w=1080"
                alt="Matcha Bakery"
                class="w-full h-[400px] lg:h-[650px] object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div class="absolute bottom-6 lg:bottom-10 left-6 lg:left-10 right-6 lg:right-10 glass-card p-5 lg:p-8 rounded-4xl lg:rounded-[3rem] shadow-2xl">
                <div class="flex items-center gap-4 lg:gap-6">
                  <div class="w-12 h-12 lg:w-16 lg:h-16 bg-bakery-900 rounded-2xl lg:rounded-4xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    <Star class="w-6 h-6 lg:w-8 lg:h-8 text-accent-gold fill-accent-gold" />
                  </div>
                  <div>
                    <p class="text-bakery-900 font-black text-xl lg:text-2xl tracking-tight">4.9/5 Rating</p>
                    <p class="text-bakery-500 font-bold uppercase tracking-widest text-[10px]">Trusted by thousands</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <!-- Signature Grid -->
      <section class="bg-white py-32 border-y border-bakery-50">
        <div class="container mx-auto px-6 text-center mb-20 space-y-4">
            <h2 class="text-5xl font-black text-bakery-900 tracking-tight">Our Artisan <span class="text-bakery-600">Icons</span></h2>
            <div class="w-20 h-1.5 bg-bakery-900 mx-auto rounded-full"></div>
        </div>
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
                <div v-for="(signatureProduct, index) in signatureProducts" :key="index" class="bg-bakery-50/30 p-8 lg:p-10 rounded-4xl lg:rounded-[3rem] text-center hover:-translate-y-3 transition-all duration-700 group border border-transparent hover:border-bakery-100 hover:bg-white hover:shadow-2xl">
                    <div :class="[`bg-linear-to-br w-24 h-24 rounded-4xl flex items-center justify-center mb-8 mx-auto shadow-2xl transform group-hover:rotate-15 transition-transform`, signatureProduct.color]">
                        <Coffee class="w-12 h-12 text-white" />
                    </div>
                    <h3 class="text-bakery-900 font-black text-xl mb-3">{{ signatureProduct.name }}</h3>
                    <p class="text-bakery-500 text-sm font-medium leading-relaxed">{{ signatureProduct.description }}</p>
                </div>
            </div>
        </div>
      </section>


      <!-- Philosophy Section -->
      <section class="bg-accent-cream py-40">
        <div class="container mx-auto px-6">
          <div class="grid lg:grid-cols-3 gap-20 items-center">
            <div class="lg:col-span-1 space-y-8">
                <div class="w-16 h-1 bg-bakery-900 rounded-full"></div>
                <h2 class="text-5xl font-black text-bakery-900 leading-[1.1] tracking-tighter">Better Dough,<br/>Bigger Dreams.</h2>
                <p class="text-bakery-500 text-lg font-medium leading-relaxed">We believe that the best pastries start with the best ingredients. That's why we source everything sustainably and organically.</p>
                <button @click="onViewMenu" class="inline-flex items-center text-bakery-900 font-black text-lg gap-3 group">
                    {{ t('landing.viewMenu') }}
                    <div class="w-10 h-10 rounded-full bg-bakery-900 text-white flex items-center justify-center group-hover:translate-x-2 transition-transform shadow-xl">
                        <ArrowRight class="w-5 h-5" />
                    </div>
                </button>
            </div>
            <div class="lg:col-span-2 grid md:grid-cols-2 gap-10">
                <div 
                    v-for="(feature, index) in features"
                    :key="index"
                    class="p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] bg-white border border-bakery-50 hover:border-bakery-100 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] group"
                >
                    <div class="w-16 h-16 rounded-3xl bg-bakery-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-bakery-900 group-hover:text-white transition-all duration-500 text-bakery-900 shadow-sm">
                        <component :is="feature.icon" class="w-8 h-8" />
                    </div>
                    <h3 class="text-bakery-900 font-black text-2xl mb-4 tracking-tight">{{ feature.title }}</h3>
                    <p class="text-bakery-500 font-medium leading-relaxed">{{ feature.description }}</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Store Locator Section -->
      <section class="bg-white py-32">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16 space-y-4">
            <h2 class="text-5xl font-black text-bakery-900 tracking-tight">Visit Our <span class="text-bakery-600">Store</span></h2>
            <div class="w-20 h-1.5 bg-bakery-900 mx-auto rounded-full"></div>
            <p class="text-xl text-bakery-500 font-medium max-w-2xl mx-auto pt-4">
              Come by and experience the aroma of freshly baked goods in person.
            </p>
          </div>
          
          <div class="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-bakery-50 h-[500px] group">
            <iframe 
               :key="mapUrl"
               width="100%" 
               height="100%" 
               style="border:0;" 
               loading="lazy" 
               allowfullscreen 
               :src="mapUrl">
            </iframe>
            
            <!-- Floating Store Card -->
            <div class="absolute bottom-6 left-6 md:bottom-10 md:left-10 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-bakery-100 max-w-sm transform group-hover:-translate-y-2 transition-transform duration-500">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-bakery-900 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-bakery-900 font-black text-lg mb-1">The Artisan Bakery</h3>
                  <p class="text-bakery-500 text-sm font-medium mb-3 line-clamp-2">
                    {{ storeLocation || t('landing.locationTitle') }}
                  </p>
                  <div class="flex items-center gap-2 text-bakery-600 text-sm font-bold">
                    <Clock class="w-4 h-4" />
                    <span>Open 6 AM - 8 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Modern Section -->
      <section class="container mx-auto px-6 mb-20 lg:mb-32">
        <div class="bg-bakery-900 rounded-[3rem] lg:rounded-[5rem] py-20 lg:py-32 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] group">
            <div class="absolute inset-0 opacity-20 transition-transform duration-[10s] group-hover:scale-125">
                <img src="https://images.unsplash.com/photo-1555932450-31a8aec2adf1?auto=format&fit=crop&q=80&w=1080" class="w-full h-full object-cover">
            </div>
            <div class="container mx-auto px-6 text-center relative z-10 space-y-8 lg:space-y-12">
              <div class="max-w-4xl mx-auto space-y-6 lg:space-y-8">
                <h2 class="text-5xl lg:text-8xl text-white font-black tracking-tighter leading-tight">
                  Taste the <br/>
                  <span class="text-bakery-400">Excellence.</span>
                </h2>
                <p class="text-xl text-bakery-200/70 font-medium max-w-2xl mx-auto">
                   {{ t('landing.heroSubtitle') }}
                </p>
              </div>
              <div class="flex flex-col sm:flex-row items-center justify-center gap-8">
                  <button 
                    @click="onGetStarted"
                     class="h-20 px-16 rounded-[2.5rem] bg-white text-bakery-900 font-black text-xl hover:bg-bakery-50 shadow-2xl transition-all active:scale-95 flex items-center gap-4 group/btn"
                  >
                    {{ t('landing.enterShop') }}
                    <ArrowRight class="w-7 h-7 group-hover/btn:translate-x-2 transition-transform" />
                  </button>
                  <div class="flex items-center gap-12 text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">
                      <div class="flex items-center gap-3">
                           <Clock class="w-5 h-5 text-bakery-400" /> 6 AM - 8 PM
                      </div>
                       <div class="flex items-center gap-3">
                           <MapPin class="w-5 h-5 text-bakery-400" /> {{ storeLocation || t('landing.locationTitle') }}
                      </div>
                  </div>
              </div>
            </div>
        </div>
      </section>

      <!-- Footer -->
       <footer class="bg-accent-cream py-20 border-t border-bakery-100">
        <div class="container mx-auto px-6">
          <div class="flex flex-col md:flex-row justify-between items-center gap-12">
            <router-link to="/" class="flex items-center gap-5 group no-transition-all">
              <div class="w-14 h-14 rounded-2xl overflow-hidden border-2 border-bakery-200 shadow-xl transform group-hover:rotate-6 transition-transform">
                <img src="/matcha-cake-logo.png" alt="Logo" class="w-full h-full object-cover" />
              </div>
              <div>
                <h3 class="text-bakery-900 font-black text-2xl tracking-tighter">The Artisan Bakery</h3>
                <p class="text-[10px] text-bakery-500 font-black uppercase tracking-[0.3em]">Est. 2020</p>
              </div>
            </router-link>
            <div class="text-bakery-400 text-[10px] font-black tracking-[0.4em] uppercase">
              {{ t('landing.footerText') }}
            </div>
          </div>
        </div>
      </footer>

    </div>
</template>
