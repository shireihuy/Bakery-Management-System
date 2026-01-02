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
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-vue-next";

import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { user } = useAuth();

const onGetStarted = () => {
    if (user.value) {
        // Redirect based on role
        if (['admin', 'manager', 'baker', 'cashier'].includes(user.value.role)) {
            router.push('/dashboard');
        } else {
            router.push('/customer');
        }
    } else {
        router.push('/login');
    }
};

// Mock Products Data (since we are migrating without full backend yet)
const menuProducts = ref([
  {
    id: "1",
    name: "Matcha Croissant",
    category: "Pastries",
    price: 5.00,
    image: "https://images.unsplash.com/photo-1733754348873-feeb45df3bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MXx8fHwxNzYxOTE5MTc0fDA&ixlib=rb-4.1.0&q=80&w=400",
    description: "Buttery, flaky French pastry with a golden, crisp exterior and soft, layered interior.",
    rating: 4.8
  },
  {
    id: "2",
    name: "Sourdough Bread",
    category: "Bread",
    price: 6.00,
    image: "https://images.unsplash.com/photo-1597604391235-a7429b4b350c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VyZG91Z2glMjBicmVhZHxlbnwxfHx8fDE3NjE4NTc4ODR8MA&ixlib=rb-4.1.0&q=80&w=400",
    description: "Traditional sourdough with a crispy crust and tangy flavor.",
    rating: 4.9
  },
   { 
    id: "7", 
    name: "Matcha Cake", 
    category: "Cakes", 
    price: 22.00, 
    image: "https://images.unsplash.com/photo-1622374149938-1c0b1a08ad11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBjYWtlJTIwZ3JlZW4lMjB0ZWF8ZW58MXx8fHwxNzY0OTM5NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Delicate layers of premium Japanese matcha cake with white chocolate cream frosting.",
    rating: 5.0
  },
  { 
    id: "10", 
    name: "Matcha Latte", 
    category: "Beverages", 
    price: 5.50, 
    image: "https://images.unsplash.com/photo-1725799957338-51f677c0ffa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBsYXR0ZSUyMGRyaW5rfGVufDF8fHx8MTc2NDkxNzk0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Creamy matcha latte made with ceremonial grade matcha and steamed milk.",
    rating: 4.7
  },
  {
    id: "4",
    name: "Matcha Mochi Donut",
    category: "Donuts",
    price: 3.50,
    image: "https://images.unsplash.com/photo-1549590143-d5855148a9d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2NoaSUyMGRvbnV0fGVufDF8fHx8MTc2NDkzOTgwNHww&ixlib=rb-4.1.0&q=80&w=400",
    description: "Chewy, pull-apart mochi donuts with a vibrant matcha glaze.",
    rating: 4.9
  },
  {
    id: "5",
    name: "Green Tea Macarons",
    category: "Pastries",
    price: 12.00,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNhcm9uc3xlbnwxfHx8fDE3NjQ5Mzk4NTB8MA&ixlib=rb-4.1.0&q=80&w=400",
    description: "Elegant French macarons filled with rich matcha ganache.",
    rating: 4.6
  },
  {
    id: "6",
    name: "Matcha Cheesecake",
    category: "Cakes",
    price: 7.50,
    image: "https://images.unsplash.com/photo-1622374149938-1c0b1a08ad11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBjYWtlfGVufDF8fHx8MTc2NDkzOTc1OHww&ixlib=rb-4.1.0&q=80&w=400",
    description: "Velvety smooth cheesecake with a hint of matcha and a graham cracker crust.",
    rating: 4.8
  }
]);

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
    <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <!-- Header -->
      <header class="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50 shadow-sm">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div class="w-10 h-10 rounded-lg overflow-hidden border border-green-200 shadow-sm">
                <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
              </div>
              <div>
                <h1 class="text-green-900 font-bold text-lg">Matcha Bakery</h1>
                <p class="text-sm text-green-600">Fresh Daily Since 2020</p>
              </div>
            </router-link>
            <button 
              @click="onGetStarted"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              Order Online
              <ArrowRight class="w-4 h-4 ml-2" />
            </button>
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
      <section class="container mx-auto px-6 py-20">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <div class="inline-block">
              <span class="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full border border-green-200 text-sm font-medium">
                🍃 Organic • Fresh • Delicious
              </span>
            </div>
            <h1 class="text-5xl lg:text-6xl text-green-900 leading-tight font-bold">
              Artisan Bakery with a <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Matcha Twist</span>
            </h1>
            <p class="text-xl text-green-700">
              Welcome to Matcha Bakery, where traditional baking meets Japanese-inspired flavors. Every morning, we bake fresh breads, pastries, and our signature matcha treats using premium ingredients and time-honored techniques.
            </p>
            <div class="flex flex-wrap gap-4 pt-4">
              <button 
                @click="onGetStarted"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Order Now
                <ShoppingCart class="w-5 h-5 ml-2" />
              </button>
              <button 
                @click="router.push('/customer')"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 border-2 border-green-600 text-green-700 hover:bg-green-50 bg-transparent"
              >
                View Menu
              </button>
            </div>
            <div class="flex items-center gap-8 pt-4">
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-5 h-5 text-green-600" />
                <span class="text-green-700">Daily Fresh</span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-5 h-5 text-green-600" />
                <span class="text-green-700">Organic Ingredients</span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-5 h-5 text-green-600" />
                <span class="text-green-700">Handcrafted</span>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl blur-3xl opacity-20"></div>
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1592637970552-6c27432e7913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBiYWtlcnklMjBjYWZlfGVufDF8fHx8MTc2NDg1MzcyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Matcha Bakery Interior"
                class="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="bg-white py-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl text-green-900 mb-4 font-bold">
              Why Choose Matcha Bakery?
            </h2>
            <p class="text-xl text-green-600 max-w-2xl mx-auto">
              Experience the perfect blend of tradition and innovation in every bite
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
                v-for="(feature, index) in features"
                :key="index"
                class="group bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
                <div class="bg-gradient-to-br from-green-500 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <component :is="feature.icon" class="w-6 h-6 text-white" />
                </div>
                <h3 class="text-green-900 mb-2 font-bold">{{feature.title}}</h3>
                <p class="text-green-600">{{feature.description}}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Products Section -->
      <section class="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 py-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl text-green-900 mb-4 font-bold">
              Our Signature Selection
            </h2>
            <p class="text-xl text-green-600 max-w-2xl mx-auto">
              Discover our most popular items, loved by the community
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div 
                v-for="(product, index) in products"
                :key="index"
                class="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100"
            >
                <div :class="`bg-gradient-to-br ${product.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto`">
                    <Coffee class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-green-900 text-center mb-2 font-bold">{{product.name}}</h3>
                <p class="text-green-600 text-center text-sm">{{product.description}}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Gallery Section -->
      <section class="bg-white py-20">
        <div class="container mx-auto px-6">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div class="space-y-8">
              <div>
                <h2 class="text-4xl text-green-900 mb-4 font-bold">
                  Baked Fresh Every Morning
                </h2>
                <p class="text-xl text-green-600">
                  Step into our bakery and experience the aroma of freshly baked bread, the warmth of our ovens, and the smiles of our dedicated team.
                </p>
              </div>
              <div class="grid grid-cols-2 gap-6">
                <!-- Info cards... -->
                 <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
                  <div class="flex items-center gap-2 mb-2">
                    <Clock class="w-5 h-5 text-green-600" />
                    <h4 class="text-green-900 font-bold">Open Daily</h4>
                  </div>
                  <p class="text-green-600 text-sm">6 AM - 8 PM</p>
                </div>
                 <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
                  <div class="flex items-center gap-2 mb-2">
                    <MapPin class="w-5 h-5 text-green-600" />
                    <h4 class="text-green-900 font-bold">Location</h4>
                  </div>
                  <p class="text-green-600 text-sm">Downtown District</p>
                </div>
                 <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
                  <div class="flex items-center gap-2 mb-2">
                    <Phone class="w-5 h-5 text-green-600" />
                    <h4 class="text-green-900 font-bold">Call Us</h4>
                  </div>
                  <p class="text-green-600 text-sm">(555) 123-4567</p>
                </div>
                 <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
                  <div class="flex items-center gap-2 mb-2">
                    <Mail class="w-5 h-5 text-green-600" />
                    <h4 class="text-green-900 font-bold">Email</h4>
                  </div>
                  <p class="text-green-600 text-sm">hello@matcha.cafe</p>
                </div>
              </div>
            </div>
            <div class="space-y-6">
              <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-green-100">
                 <img 
                  src="https://images.unsplash.com/photo-1555932450-31a8aec2adf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyZWFkJTIwYmFrZXJ5fGVufDF8fHx8MTc2NDc1NTk0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Fresh Bread"
                  class="w-full h-[250px] object-cover"
                />
              </div>
              <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-green-100">
                 <img 
                  src="https://images.unsplash.com/photo-1741092966238-4302f0d98576?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwcGFzdHJpZXN8ZW58MXx8fHwxNzY0ODU0MDA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Artisan Pastries"
                  class="w-full h-[250px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 py-20">
        <div class="container mx-auto px-6 text-center">
          <div class="max-w-3xl mx-auto space-y-6">
            <h2 class="text-4xl lg:text-5xl text-white font-bold">
              Ready to Taste the Difference?
            </h2>
            <p class="text-xl text-green-100">
              Visit us today or order online for pickup. Your taste buds will thank you!
            </p>
            <div class="pt-4">
              <button 
                @click="onGetStarted"
                 class="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-8 bg-white text-green-700 hover:bg-green-50 shadow-2xl hover:shadow-3xl transition-all text-lg"
              >
                Order Online Now
                <ShoppingCart class="w-5 h-5 ml-2" />
              </button>
            </div>
            <p class="text-green-100 text-sm">
              Open Daily 6 AM - 8 PM • Downtown District • Free Parking Available
            </p>
          </div>
        </div>
      </section>

      <!-- Footer -->
       <footer class="bg-green-900 py-12">
        <div class="container mx-auto px-6">
          <div class="flex flex-col md:flex-row justify-between items-center gap-6">
            <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div class="w-10 h-10 rounded-lg overflow-hidden border border-green-200 shadow-sm">
                <img src="/matcha-cake-logo.png" alt="Matcha Bakery Logo" class="w-full h-full object-cover" />
              </div>
              <div>
                <h3 class="text-white font-bold">Matcha Bakery</h3>
                <p class="text-sm text-green-300">Fresh Daily Since 2020</p>
              </div>
            </router-link>
            <div class="text-green-300 text-sm">
              © 2025 Matcha Bakery. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
</template>
