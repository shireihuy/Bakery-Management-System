<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useAuth } from '../composables/useAuth';
import type { Language } from '../composables/translations';

const { currentLocale, setLocale, translations, updateTranslation, resetTranslations } = useI18n();
const { user } = useAuth();

const isOpen = ref(false);
const isEditorOpen = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('ALL');
const isSaving = ref(false);

type FlatTranslation = {
  path: string;
  key: string;
  value: string;
  category: string;
  label: string;
  hint: string;
};

const categoryLabels: Record<string, string> = {
  ALL: 'All text',
  COMMON: 'Common buttons',
  NAV: 'Menus & navigation',
  LANDING: 'Landing page',
  SHOP: 'Customer shop',
  AUTH: 'Login & signup',
  DASHBOARD: 'Dashboard',
  ORDERS: 'Orders',
  PRODUCTS: 'Products',
  REPORTS: 'Reports',
  USERS: 'Users',
  INVENTORY: 'Inventory',
  SETTINGS: 'Settings'
};

const categoryHints: Record<string, string> = {
  ALL: 'Everything customers and staff can read in the app.',
  COMMON: 'Short labels used across many screens.',
  NAV: 'Menu names, page links, and notification labels.',
  LANDING: 'Public homepage copy.',
  SHOP: 'Customer menu, cart, checkout, and payment text.',
  AUTH: 'Login, register, profile, and password text.',
  DASHBOARD: 'Admin dashboard cards and summaries.',
  ORDERS: 'Order list, status, details, and workflow text.',
  PRODUCTS: 'Product management labels.',
  REPORTS: 'Analytics and report wording.',
  USERS: 'User management labels.',
  INVENTORY: 'Stock and batch management labels.',
  SETTINGS: 'Settings page labels.'
};

const fieldHints: Record<string, string> = {
  'landing.heroTitle': 'Main headline on the public homepage.',
  'landing.heroSubtitle': 'Short sentence under the homepage headline.',
  'landing.viewMenu': 'Button text that sends customers to the menu.',
  'landing.enterShop': 'Main homepage button text.',
  'shop.emptyCart': 'Shown when the customer has not added anything yet.',
  'shop.checkout': 'Button text for starting payment.',
  'shop.paymentSuccess': 'Shown after a successful payment.',
  'auth.welcomeBack': 'Title on the login page.',
  'auth.createAccount': 'Title on the register page.',
  'orders.updateStatus': 'Label near the order status controls.',
  'products.uploadImage': 'Label for adding a product photo.',
  'common.loading': 'Shown while the app is waiting for data.'
};

const canEditTranslations = computed(() => {
  const role = user.value?.role?.toLowerCase();
  return role === 'admin' || role === 'manager';
});

const languages: { code: Language; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'jp', name: 'Japanese', native: '日本語' },
  { code: 'vn', name: 'Vietnamese', native: 'Tiếng Việt' }
];


const makeFriendlyLabel = (key: string) => key
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[_-]+/g, ' ')
  .replace(/\b\w/g, letter => letter.toUpperCase());

const getCategoryLabel = (category: string) => categoryLabels[category] || makeFriendlyLabel(category.toLowerCase());

const getCategoryHint = (category: string) => categoryHints[category] || 'Text used in this part of the app.';

const currentLanguage = computed(() => languages.find(lang => lang.code === currentLocale.value) || { code: 'en', name: 'English', native: 'English' });

const allTranslations = computed<FlatTranslation[]>(() => {
  const result: FlatTranslation[] = [];
  const trans = translations.value[currentLocale.value];
  
  Object.entries(trans).forEach(([category, keys]) => {
    Object.entries(keys).forEach(([key, value]) => {
      const path = `${category}.${key}`;
      result.push({
        path,
        key,
        value: value as string,
        category: category.toUpperCase(),
        label: makeFriendlyLabel(key),
        hint: fieldHints[path] || getCategoryHint(category.toUpperCase())
      });
    });
  });

  return result;
});

const categories = computed(() => {
  const found = Array.from(new Set(allTranslations.value.map(item => item.category)));
  return ['ALL', ...found].map(category => ({
    id: category,
    label: getCategoryLabel(category),
    count: category === 'ALL'
      ? allTranslations.value.length
      : allTranslations.value.filter(item => item.category === category).length
  }));
});

const flatTranslations = computed(() => {
  let filtered = allTranslations.value;
  
  if (selectedCategory.value !== 'ALL') {
    filtered = filtered.filter(item => item.category === selectedCategory.value);
  }
  
  if (!searchQuery.value) return filtered;
  
  return filtered.filter(item => 
    item.path.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.value.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectedCategoryLabel = computed(() => getCategoryLabel(selectedCategory.value));
const selectedCategoryHint = computed(() => getCategoryHint(selectedCategory.value));
const editedCount = computed(() => flatTranslations.value.length);

const shouldUseTextarea = (item: FlatTranslation) => {
  const key = item.key.toLowerCase();
  return item.value.length > 70 ||
    key.includes('subtitle') ||
    key.includes('description') ||
    key.includes('prompt') ||
    key.includes('address') ||
    key.includes('footer') ||
    key.includes('desc');
};

const handleSave = async () => {
    isSaving.value = true;
    // Simulate save delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    isSaving.value = false;
    // In current implementation, updateTranslation already saved to localStorage, 
    // but this provides the explicit "Save" action feedback requested.
    isEditorOpen.value = false;
};

const handleUpdate = (path: string, event: Event) => {
  const val = (event.target as HTMLInputElement).value;
  updateTranslation(currentLocale.value, path, val);
};
</script>

<template>
  <div class="fixed bottom-4 md:bottom-6 left-4 md:left-6 z-100 flex flex-col items-start gap-4">
    <!-- Main Toggle Button -->
    <button 
      @click="isOpen = !isOpen"
      class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-bakery-900 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden relative"
    >
      <div v-if="!isOpen" class="flex flex-col items-center justify-center gap-0.5 md:gap-1">
        <span class="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">{{ currentLocale }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      </div>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

    <!-- Settings Panel -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-10 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-10 opacity-0 scale-95"
    >
      <div v-if="isOpen" class="w-[calc(100vw-2rem)] sm:w-80 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-white/50 p-6 flex flex-col gap-6 ring-1 ring-bakery-900/5">
        <div class="flex items-center justify-between px-2">
          <h3 class="font-black text-xs uppercase tracking-[0.2em] text-bakery-400">Regional Settings</h3>
        </div>

        <!-- Language Grid -->
        <div class="grid grid-cols-1 gap-2">
          <button 
            v-for="lang in languages" 
            :key="lang.code"
            @click="setLocale(lang.code)"
            class="flex items-center justify-between p-4 rounded-3xl transition-all group relative overflow-hidden"
            :class="currentLocale === lang.code ? 'bg-bakery-900 text-white shadow-xl' : 'hover:bg-bakery-50 text-bakery-600'"
          >
            <div class="flex flex-col items-start">
              <span class="text-[10px] font-black uppercase tracking-widest opacity-60">{{ lang.name }}</span>
              <span class="text-sm font-bold">{{ lang.native }}</span>
            </div>
            <div v-if="currentLocale === lang.code" class="w-2 h-2 rounded-full bg-accent-gold shadow-[0_0_12px_#DAA520]"></div>
          </button>
        </div>

        <!-- Currency section removed as it is now auto-linked to language -->
        <div class="h-px bg-bakery-100 mx-2 -mt-4 mb-2"></div>

        <template v-if="canEditTranslations">
          <div class="h-px bg-bakery-100 mx-2"></div>

          <!-- Editor Toggle -->
          <button 
            @click="isEditorOpen = true; isOpen = false"
            class="flex items-center gap-3 px-6 py-4 rounded-3xl bg-bakery-50 hover:bg-bakery-100 text-bakery-900 transition-all group"
          >
            <div class="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <div class="flex flex-col items-start">
              <span class="text-[10px] font-black uppercase tracking-widest text-bakery-400">Customization</span>
              <span class="text-xs font-bold">Edit Translations</span>
            </div>
          </button>
        </template>
      </div>
    </Transition>

    <!-- Full Screen Editor Overlay -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 backdrop-blur-0"
      enter-to-class="opacity-100 backdrop-blur-xl"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 backdrop-blur-xl"
      leave-to-class="opacity-0 backdrop-blur-0"
    >
      <div v-if="isEditorOpen" class="fixed inset-0 z-110 bg-bakery-950/40 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm">
        <div class="w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[92vh] md:h-[85vh]">
          <!-- Editor Header -->
          <div class="p-5 md:p-8 border-b border-bakery-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shrink-0">
            <div class="space-y-3">
              <h2 class="text-2xl md:text-3xl font-black text-bakery-900 flex flex-wrap items-center gap-3">
                Text Editor
                <span class="px-3 py-1 rounded-full bg-bakery-50 text-[10px] uppercase tracking-widest text-bakery-500">Editing {{ currentLanguage.name }}</span>
              </h2>
              <p class="text-bakery-500 text-sm max-w-2xl">Update the words customers and staff see in the app. Pick a section, edit the text boxes, then save when it looks right.</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="lang in languages"
                  :key="`editor-${lang.code}`"
                  @click="setLocale(lang.code)"
                  class="px-4 py-2 rounded-2xl text-xs font-black transition-all border"
                  :class="currentLocale === lang.code ? 'bg-bakery-900 text-white border-bakery-900 shadow-md' : 'bg-white text-bakery-500 border-bakery-100 hover:border-bakery-300'"
                >
                  {{ lang.name }}
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between lg:justify-end gap-3">
              <button 
                @click="resetTranslations"
                class="px-4 md:px-6 h-12 rounded-2xl text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
              >
                Reset
              </button>
              <button 
                @click="handleSave"
                class="px-5 md:px-8 h-12 rounded-2xl bg-bakery-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-bakery-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                :disabled="isSaving"
              >
                <div v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
              <button 
                @click="isEditorOpen = false"
                class="w-12 h-12 rounded-full bg-white border border-bakery-200 text-bakery-400 flex items-center justify-center hover:rotate-90 transition-all duration-500 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Search & FilterBar -->
          <div class="px-5 md:px-8 py-4 bg-bakery-50/50 shrink-0 space-y-4">
            <div class="relative group">
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search by label, current text, or hidden key..."
                class="w-full h-14 pl-14 pr-6 rounded-2xl bg-white border border-bakery-100 focus:outline-none focus:ring-4 focus:ring-bakery-900/5 transition-all text-sm font-medium shadow-sm"
              >
              <div class="absolute left-6 top-1/2 -translate-y-1/2 text-bakery-300 group-focus-within:text-bakery-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>

            <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button 
                    v-for="cat in categories" 
                    :key="cat.id"
                    @click="selectedCategory = cat.id"
                    class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border"
                    :class="selectedCategory === cat.id ? 'bg-bakery-900 text-white shadow-md border-bakery-900' : 'bg-white text-bakery-500 hover:text-bakery-700 border-bakery-100'"
                >
                    {{ cat.label }} · {{ cat.count }}
                </button>
            </div>
          </div>

          <!-- Keys List -->
          <div class="flex-1 overflow-y-auto p-5 md:p-8 pt-4 scrollbar-hide bg-white">
            <div class="mb-6 rounded-3xl bg-bakery-50/70 border border-bakery-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.3em] text-bakery-400">Current section</p>
                <h3 class="text-xl font-black text-bakery-900">{{ selectedCategoryLabel }}</h3>
                <p class="text-sm text-bakery-500 mt-1">{{ selectedCategoryHint }}</p>
              </div>
              <div class="px-4 py-2 rounded-2xl bg-white border border-bakery-100 text-xs font-black text-bakery-500 whitespace-nowrap">
                {{ editedCount }} fields
              </div>
            </div>

            <div v-if="flatTranslations.length === 0" class="text-center py-16 rounded-3xl border border-dashed border-bakery-200">
              <p class="text-bakery-900 font-black">No text found</p>
              <p class="text-sm text-bakery-500 mt-1">Try another search word or section.</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-4">
              <div 
                v-for="item in flatTranslations" 
                :key="item.path"
                class="group p-5 rounded-3xl bg-white border border-bakery-100 shadow-sm hover:shadow-md hover:border-bakery-200 transition-all"
              >
                <div class="flex flex-col md:flex-row md:items-start gap-4">
                  <div class="w-full md:w-72 shrink-0">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-[9px] font-black uppercase tracking-widest text-bakery-400">{{ getCategoryLabel(item.category) }}</span>
                      <span class="w-1.5 h-1.5 rounded-full bg-bakery-200"></span>
                      <span class="text-[9px] font-black uppercase tracking-widest text-bakery-300">{{ currentLocale }}</span>
                    </div>
                    <label class="block text-base font-black text-bakery-900">{{ item.label }}</label>
                    <p class="text-xs text-bakery-500 leading-relaxed mt-1">{{ item.hint }}</p>
                    <details class="mt-3">
                      <summary class="cursor-pointer text-[10px] font-black uppercase tracking-widest text-bakery-300 hover:text-bakery-500">Advanced key</summary>
                      <p class="mt-1 font-mono text-[11px] text-bakery-400">{{ item.path }}</p>
                    </details>
                  </div>
                  <div class="w-full flex-1">
                    <textarea
                      v-if="shouldUseTextarea(item)"
                      :value="item.value"
                      @input="handleUpdate(item.path, $event)"
                      rows="4"
                      class="w-full px-5 py-4 rounded-2xl bg-bakery-50/40 border border-bakery-100 focus:outline-none focus:ring-4 focus:ring-bakery-900/5 transition-all text-sm font-medium shadow-sm group-hover:border-bakery-300 resize-y min-h-28"
                      placeholder="Type the text people should see..."
                    ></textarea>
                    <input 
                      v-else
                      :value="item.value"
                      @input="handleUpdate(item.path, $event)"
                      class="w-full h-14 px-5 rounded-2xl bg-bakery-50/40 border border-bakery-100 focus:outline-none focus:ring-4 focus:ring-bakery-900/5 transition-all text-sm font-medium shadow-sm active:scale-[0.99] group-hover:border-bakery-300"
                      placeholder="Type the text people should see..."
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 bg-bakery-50/30 text-center border-t border-bakery-100 shrink-0">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-bakery-300">Text editor · Changes are saved to this browser</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
