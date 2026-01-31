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

const categories = ['ALL', 'COMMON', 'NAV', 'LANDING', 'SHOP', 'AUTH'];

const canEditTranslations = computed(() => {
  const role = user.value?.role?.toLowerCase();
  return role === 'admin' || role === 'manager';
});

const languages: { code: Language; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'jp', name: 'Japanese', native: '日本語' },
  { code: 'vn', name: 'Vietnamese', native: 'Tiếng Việt' }
];

// Flat list of translation keys for the editor
const flatTranslations = computed(() => {
  const result: { path: string; value: string; category: string }[] = [];
  const trans = translations.value[currentLocale.value];
  
  Object.entries(trans).forEach(([category, keys]) => {
    Object.entries(keys).forEach(([key, value]) => {
      result.push({
        path: `${category}.${key}`,
        value: value as string,
        category: category.toUpperCase()
      });
    });
  });
  
  let filtered = result;
  
  if (selectedCategory.value !== 'ALL') {
    filtered = filtered.filter(item => item.category === selectedCategory.value);
  }
  
  if (!searchQuery.value) return filtered;
  
  return filtered.filter(item => 
    item.path.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.value.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

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
  <div class="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
    <!-- Main Toggle Button -->
    <button 
      @click="isOpen = !isOpen"
      class="w-14 h-14 rounded-full bg-bakery-900 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden relative"
    >
      <div v-if="!isOpen" class="flex flex-col items-center justify-center gap-1">
        <span class="text-[10px] font-black uppercase tracking-tighter">{{ currentLocale }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      </div>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
      <div v-if="isOpen" class="w-80 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-white/50 p-6 flex flex-col gap-6 ring-1 ring-bakery-900/5">
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
      <div v-if="isEditorOpen" class="fixed inset-0 z-[110] bg-bakery-950/40 flex items-center justify-center p-6 backdrop-blur-sm">
        <div class="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
          <!-- Editor Header -->
          <div class="p-8 border-b border-bakery-100 flex items-center justify-between shrink-0">
            <div>
              <h2 class="text-2xl font-black text-bakery-900 flex items-center gap-4">
                Localization Lab
                <span class="px-3 py-1 rounded-full bg-bakery-50 text-[10px] uppercase tracking-widest text-bakery-500">{{ currentLocale }}</span>
              </h2>
              <p class="text-bakery-500 text-sm mt-1">Fine-tune the voice of your bakery. Changes are applied instantly.</p>
            </div>
            <div class="flex items-center gap-4">
              <button 
                @click="resetTranslations"
                class="px-6 h-12 rounded-2xl text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
              >
                Reset
              </button>
              <button 
                @click="handleSave"
                class="px-8 h-12 rounded-2xl bg-bakery-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-bakery-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
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
          <div class="px-8 py-4 bg-bakery-50/50 shrink-0 space-y-4">
            <div class="relative group">
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search for text or keys..."
                class="w-full h-14 pl-14 pr-6 rounded-2xl bg-white border border-bakery-100 focus:outline-none focus:ring-4 focus:ring-bakery-900/5 transition-all text-sm font-medium shadow-sm"
              >
              <div class="absolute left-6 top-1/2 -translate-y-1/2 text-bakery-300 group-focus-within:text-bakery-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
                <button 
                    v-for="cat in categories" 
                    :key="cat"
                    @click="selectedCategory = cat"
                    class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                    :class="selectedCategory === cat ? 'bg-bakery-900 text-white shadow-md' : 'bg-white text-bakery-400 hover:text-bakery-600 border border-bakery-100'"
                >
                    {{ cat }}
                </button>
            </div>
          </div>

          <!-- Keys List -->
          <div class="flex-1 overflow-y-auto p-8 pt-4 scrollbar-hide">
            <div class="grid grid-cols-1 gap-4">
              <div 
                v-for="item in flatTranslations" 
                :key="item.path"
                class="group flex flex-col md:flex-row items-start md:items-center gap-4 p-5 rounded-3xl hover:bg-bakery-50 transition-all border border-transparent hover:border-bakery-100"
              >
                <div class="w-full md:w-1/3">
                  <div class="text-[9px] font-black uppercase tracking-widest text-bakery-400 mb-1">{{ item.category }}</div>
                  <div class="text-xs font-mono font-bold text-bakery-900">{{ item.path }}</div>
                </div>
                <div class="w-full md:w-2/3 flex gap-3">
                  <input 
                    :value="item.value"
                    @input="handleUpdate(item.path, $event)"
                    class="flex-1 h-12 px-5 rounded-2xl bg-white border border-bakery-100 focus:outline-none focus:ring-4 focus:ring-bakery-900/5 transition-all text-sm font-medium shadow-sm active:scale-[0.99] group-hover:border-bakery-300"
                    placeholder="Enter translation..."
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 bg-bakery-50/30 text-center border-t border-bakery-100 shrink-0">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-bakery-300">Bakery Lab v1.0 • Changes saved to local storage</p>
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
