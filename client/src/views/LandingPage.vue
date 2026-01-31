<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ShoppingCart, 
  Coffee,
  Package, 
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

const router = useRouter();
const { user } = useAuth();

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
    // We want to show a selection of products, maybe filter for specific ones or just take first 8
    // If db is empty, return empty array (or fallback to empty)
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

onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    fetchProducts();
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

// Auto-rotate carousel
// Using interval roughly translated from React
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
            // Force reflow
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
        // Force reflow
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

const features = [
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
    },
    {
        icon: Clock,
        title: "Open Early",
        description: "Start your day right! We open at 6 AM to serve you the freshest breakfast treats."
    },
    {
        icon: Package,
        title: "Custom Orders",
        description: "Need something special? We offer custom cakes and catering for your events."
    }
];


const products = [
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

</script>

<template>
    <div class="min-h-screen bg-accent-cream">
      <!-- Header -->
      <header class="glass-header">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <router-link to="/" class="flex items-center gap-4 group no-transition-all">
              <div class="w-12 h-12 rounded-xl overflow-hidden border-2 border-bakery-200 shadow-md transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500">
                <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
              </div>
              <div>
                <h1 class="text-bakery-900 font-bold text-xl tracking-tight">The Artisan <span class="text-bakery-600">Bakery</span></h1>
                <p class="text-xs text-bakery-500 uppercase tracking-widest font-semibold">Fresh • Organic • Daily</p>
              </div>
            </router-link>
            <div class="flex items-center gap-4">
              <button 
                @click="onGetStarted"
                class="inline-flex items-center justify-center rounded-xl text-sm font-semibold h-11 px-6 bg-bakery-600 hover:bg-bakery-700 text-white shadow-lg hover:shadow-bakery-200 transition-all active:scale-95"
              >
                {{ user ? 'Enter Shop' : 'Order Online' }}
                <ArrowRight class="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </header>


      <!-- Carousel Section (Simplified for Migration Proof of Concept) -->
       <section class="bg-white border-b border-green-200 py-12">
        <div class="container mx-auto px-6">
          <div class="text-center mb-8">
            <h2 class="text-3xl text-green-900 mb-2 font-bold">
              Today's Fresh Selection
            </h2>
            <p class="text-green-600">
              Discover our delicious menu items, baked fresh daily
            </p>
          </div>
           <!-- Simplified Display for now -->
           <div class="relative group">
                <div class="overflow-hidden">
                    <div 
                        class="flex" 
                        :class="{ 'transition-transform duration-500 ease-in-out': isTransitioning }"
                        :style="{ transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)` }"
                    >
                        <div 
                            v-for="(product, idx) in displayProducts" 
                            :key="`${product.id}-${idx}`" 
                            class="flex-shrink-0 px-3"
                            :style="{ width: `${100 / slidesToShow}%` }"
                        >
                            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                                <div class="relative h-64 overflow-hidden group/item">
                                    <img
                                        :src="product.image"
                                        :alt="product.name"
                                        class="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                    />
                                    <div class="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-full text-sm shadow-md">
                                        {{product.category}}
                                    </div>
                                    <div v-if="product.rating" class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        <Star class="w-4 h-4 fill-green-500 text-green-500" />
                                        <span class="text-sm text-green-900 font-bold">{{product.rating}}</span>
                                    </div>
                                </div>
                                <div class="p-5 flex-1 flex flex-col">
                                    <h3 class="text-green-900 mb-2 font-bold">{{product.name}}</h3>
                                    <p class="text-sm text-green-600 mb-4 line-clamp-2 h-10">{{product.description}}</p>
                                    <div class="flex items-center justify-between mt-auto">
                                        <span class="text-2xl text-green-900 font-bold">
                                            ${{product.price.toFixed(2)}}
                                        </span>
                                        <button
                                            @click="onGetStarted"
                                            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
                                        >
                                            Order Now
                                            <ArrowRight class="w-3 h-3 ml-1" />
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
                    class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg border border-green-100 flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0 z-10"
                >
                    <ChevronLeft class="w-6 h-6" />
                </button>
                <button 
                    @click="nextSlide"
                    class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg border border-green-100 flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0 z-10"
                >
                    <ChevronRight class="w-6 h-6" />
                </button>

                <!-- Pagination Dots -->
                <div v-if="totalDots > 1" class="flex justify-center mt-8 gap-2">
                    <button 
                        v-for="(_, index) in totalDots" 
                        :key="index"
                        @click="goToSlide(index)"
                        :class="[currentSlide === index ? 'bg-green-600 w-8' : 'bg-green-200 w-2 hover:bg-green-300']"
                        class="h-2 rounded-full transition-all duration-300"
                        :title="`Go to slide ${index + 1}`"
                    ></button>
                </div>
           </div>
        </div>
       </section>
      
      <!-- Hero Section -->
      <section class="container mx-auto px-6 py-24 lg:py-32">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div class="space-y-8 animate-in slide-in-from-left duration-1000">
            <div class="inline-block">
              <span class="bg-bakery-100 text-bakery-700 px-4 py-2 rounded-full border border-bakery-200 text-sm font-bold uppercase tracking-widest shadow-sm">
                🍃 Artisanal Selection
              </span>
            </div>
            <h1 class="text-6xl lg:text-7xl text-bakery-900 leading-[1.1] font-bold">
              Pure Matcha <br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-bakery-600 to-bakery-400">Crafted with Love</span>
            </h1>
            <p class="text-xl text-bakery-700 leading-relaxed max-w-xl">
              Discover the perfect harmony of traditional French pastry and premium Japanese matcha. Our artisan bakers craft fresh delights every sunrise, just for you.
            </p>
            <div class="flex flex-wrap gap-6 pt-4">
              <button 
                @click="onGetStarted"
                class="inline-flex items-center justify-center rounded-2xl text-lg font-bold h-14 px-10 bg-bakery-600 hover:bg-bakery-700 text-white shadow-2xl shadow-bakery-200 hover:-translate-y-1 transition-all active:scale-95"
              >
                {{ user ? 'Go to Store' : 'Order Now' }}
                <ShoppingCart class="w-6 h-6 ml-3" />
              </button>
              <button 
                @click="onViewMenu"
                class="inline-flex items-center justify-center rounded-2xl text-lg font-bold h-14 px-10 border-2 border-bakery-200 text-bakery-800 hover:bg-bakery-50 transition-all"
              >
                Explore Menu
              </button>
            </div>
            <div class="flex items-center gap-10 pt-8 border-t border-bakery-100">
              <div class="flex flex-col">
                <span class="text-2xl font-bold text-bakery-900">100%</span>
                <span class="text-sm text-bakery-500 font-medium">Organic Flour</span>
              </div>
              <div class="flex flex-col">
                <span class="text-2xl font-bold text-bakery-900">Daily</span>
                <span class="text-sm text-bakery-500 font-medium">Fresh Baked</span>
              </div>
              <div class="flex flex-col">
                <span class="text-2xl font-bold text-bakery-900">Premium</span>
                <span class="text-sm text-bakery-500 font-medium">Grade Matcha</span>
              </div>
            </div>
          </div>
          <div class="relative animate-in zoom-in duration-1000 delay-300">
            <div class="absolute -inset-4 bg-bakery-400/20 rounded-[3rem] blur-3xl animate-pulse-slow"></div>
            <div class="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
              <img 
                src="https://images.unsplash.com/photo-1592637970552-6c27432e7913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBiYWtlcnklMjBjYWZlfGVufDF8fHx8MTc2NDg1MzcyNHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Matcha Bakery Interior"
                class="w-full h-[600px] object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div class="absolute bottom-8 left-8 right-8 glass-card p-6 rounded-2xl animate-float">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-bakery-100 rounded-full flex items-center justify-center">
                    <Star class="w-6 h-6 text-bakery-600 fill-bakery-600" />
                  </div>
                  <div>
                    <p class="text-bakery-900 font-bold text-lg">4.9/5 Rating</p>
                    <p class="text-bakery-600 text-sm">Loved by 2k+ daily customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section class="bg-white py-32 border-y border-bakery-50">
        <div class="container mx-auto px-6 text-center mb-16 space-y-4">
            <h2 class="text-4xl lg:text-5xl font-black text-bakery-900 tracking-tight">Our Signature <span class="text-bakery-600">Selection</span></h2>
            <p class="text-bakery-500 max-w-2xl mx-auto text-lg font-medium">Experience our most celebrated creations, handcrafted with 100% organic Japanese matcha and French techniques.</p>
        </div>
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
                <div v-for="(signatureProduct, index) in products" :key="index" class="glass-card p-8 rounded-[2.5rem] text-center hover:-translate-y-2 transition-all duration-500 group border border-bakery-50">
                    <div :class="[`bg-gradient-to-br w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg transform group-hover:rotate-12 transition-transform`, signatureProduct.color]">
                        <Coffee class="w-10 h-10 text-white" />
                    </div>
                    <h3 class="text-bakery-900 font-black text-lg mb-2">{{ signatureProduct.name }}</h3>
                    <p class="text-bakery-500 text-sm font-medium leading-relaxed">{{ signatureProduct.description }}</p>
                </div>
            </div>
        </div>
      </section>



      <!-- Why Us - Features Modern Grid -->
      <section class="bg-accent-cream py-32">
        <div class="container mx-auto px-6">
          <div class="grid lg:grid-cols-3 gap-12">
            <div class="lg:col-span-1 space-y-6">
                <span class="text-bakery-600 font-black uppercase tracking-widest text-sm">Our Philosophy</span>
                <h2 class="text-4xl font-black text-bakery-900 leading-tight">Better Ingredients,<br/>Better Baking.</h2>
                <p class="text-bakery-500 text-lg font-medium">We believe that the best pastries start with the best ingredients. That's why we source everything sustainably and organically.</p>
                <button @click="onViewMenu" class="inline-flex items-center text-bakery-900 font-black group">
                    Explore the full menu
                    <ArrowRight class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
            </div>
            <div class="lg:col-span-2 grid md:grid-cols-2 gap-8">
                <div 
                    v-for="(feature, index) in features.slice(0, 4)"
                    :key="index"
                    class="p-8 rounded-[2rem] bg-white border border-bakery-50 hover:border-bakery-200 transition-all hover:shadow-2xl hover:shadow-bakery-100 group"
                >
                    <div class="w-14 h-14 rounded-2xl bg-bakery-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-bakery-100 transition-all">
                        <component :is="feature.icon" class="w-6 h-6 text-bakery-600" />
                    </div>
                    <h3 class="text-bakery-900 font-bold text-xl mb-3">{{ feature.title }}</h3>
                    <p class="text-bakery-500 font-medium leading-relaxed">{{ feature.description }}</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Modern Section -->
      <section class="bg-bakery-900 py-24 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <img src="https://images.unsplash.com/photo-1555932450-31a8aec2adf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyZWFkJTIwYmFrZXJ5fGVufDF8fHx8MTc2NDc1NTk0M3ww&ixlib=rb-4.1.0&q=80&w=1080" class="w-full h-full object-cover">
        </div>
        <div class="container mx-auto px-6 text-center relative z-10 space-y-10">
          <div class="max-w-3xl mx-auto space-y-6">
            <h2 class="text-5xl lg:text-7xl text-white font-black tracking-tight leading-tight">
              Ready to Taste <br/>
              <span class="text-bakery-400">Handcrafted Excellence?</span>
            </h2>
            <p class="text-xl text-bakery-200/80 font-medium tracking-tight">
              Visit us today or order online for premium pickup. Your journey to matcha heaven starts here.
            </p>
          </div>
          <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                @click="onGetStarted"
                 class="h-16 px-12 rounded-2xl bg-white text-bakery-900 font-black text-xl hover:bg-bakery-50 shadow-2xl transition-all active:scale-95 flex items-center gap-3"
              >
                Order Online Now
                <ArrowRight class="w-6 h-6" />
              </button>
              <div class="flex items-center gap-10 text-white/60 font-bold uppercase tracking-widest text-xs">
                  <div class="flex items-center gap-2">
                       <Clock class="w-4 h-4" /> 6 AM - 8 PM
                  </div>
                   <div class="flex items-center gap-2">
                       <MapPin class="w-4 h-4" /> Downtown
                  </div>
              </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
       <footer class="bg-accent-cream py-16 border-t border-bakery-100">
        <div class="container mx-auto px-6">
          <div class="flex flex-col md:flex-row justify-between items-center gap-10">
            <router-link to="/" class="flex items-center gap-4 group no-transition-all">
              <div class="w-12 h-12 rounded-xl overflow-hidden border-2 border-bakery-200 shadow-md transform group-hover:rotate-6 transition-transform">
                <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
              </div>
              <div>
                <h3 class="text-bakery-900 font-black text-xl tracking-tight">The Artisan Bakery</h3>
                <p class="text-xs text-bakery-500 font-bold uppercase tracking-widest">Est. 2020</p>
              </div>
            </router-link>
            <div class="text-bakery-400 text-sm font-bold tracking-widest uppercase">
              © 2025 Matcha Bakery. Crafted with passion.
            </div>
          </div>
        </div>
      </footer>

    </div>
</template>
