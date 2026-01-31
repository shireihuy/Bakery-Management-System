<script setup lang="ts">
import { Moon, Sun, Languages, Settings2 } from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme';
import { useI18n } from '../composables/useI18n';
import { ref } from 'vue';

const { isDark, toggleTheme } = useTheme();
const { locale, setLocale } = useI18n();
const isOpen = ref(false);

const toggleOpen = () => isOpen.value = !isOpen.value;
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[100]">
    <!-- Main Toggle Button -->
    <button 
      @click="toggleOpen"
      class="w-14 h-14 rounded-2xl bg-bakery-900 dark:bg-white text-white dark:text-bakery-900 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group"
      :class="{ 'rotate-90': isOpen }"
    >
      <Settings2 class="w-6 h-6 transition-transform group-hover:rotate-45" />
    </button>

    <!-- Options Menu -->
    <div 
      v-if="isOpen"
      class="absolute bottom-20 right-0 glass-card p-4 rounded-3xl border border-bakery-100 dark:border-bakery-800 min-w-[200px] shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      <div class="space-y-6">
        <!-- Theme Section -->
        <div class="space-y-3">
          <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400">Appearance</p>
          <button 
            @click="toggleTheme"
            class="w-full flex items-center justify-between p-3 rounded-xl bg-bakery-50/50 dark:bg-bakery-900/50 hover:bg-bakery-100 dark:hover:bg-bakery-800 transition-colors"
          >
            <div class="flex items-center gap-3">
              <Sun v-if="isDark" class="w-4 h-4 text-bakery-600 dark:text-bakery-400" />
              <Moon v-else class="w-4 h-4 text-bakery-600 dark:text-bakery-400" />
              <span class="text-sm font-bold text-bakery-900 dark:text-white">{{ isDark ? 'Light' : 'Dark' }} Mode</span>
            </div>
            <div 
              class="w-10 h-5 rounded-full bg-bakery-200 dark:bg-bakery-700 relative transition-colors"
              :class="{ '!bg-bakery-600': isDark }"
            >
              <div 
                class="absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300"
                :class="isDark ? 'left-6' : 'left-1'"
              ></div>
            </div>
          </button>
        </div>

        <!-- Language Section -->
        <div class="space-y-3">
          <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400">Language</p>
          <div class="grid grid-cols-1 gap-2">
            <button 
              v-for="l in (['en', 'jp', 'vn'] as const)" 
              :key="l"
              @click="setLocale(l)"
              class="flex items-center justify-between p-3 rounded-xl transition-all border"
              :class="locale === l ? 'bg-bakery-900 text-white border-bakery-900' : 'bg-bakery-50/50 dark:bg-bakery-900/50 text-bakery-600 dark:text-bakery-400 border-transparent hover:border-bakery-200'"
            >
              <div class="flex items-center gap-3">
                <Languages class="w-4 h-4 opacity-70" />
                <span class="text-sm font-bold">{{ l === 'en' ? 'English' : l === 'jp' ? '日本語' : 'Tiếng Việt' }}</span>
              </div>
              <div v-if="locale === l" class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
