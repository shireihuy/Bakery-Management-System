<script setup lang="ts">
import { ref } from 'vue';
import { Check, ShieldCheck } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

const isChecked = ref(false);
const isVerifying = ref(false);
const isVerified = ref(false);

const emit = defineEmits(['verify']);

const handleCheck = () => {
  if (isVerified.value || isVerifying.value) return;
  
  isVerifying.value = true;
  
  // Simulate a verification delay
  setTimeout(() => {
    isVerifying.value = false;
    isVerified.value = true;
    isChecked.value = true;
    emit('verify', true);
  }, 800);
};
</script>

<template>
  <div 
    class="w-full p-4 rounded-2xl border border-bakery-100 bg-white/40 backdrop-blur-sm flex items-center justify-between transition-all duration-300"
    :class="{ 'border-bakery-500 bg-bakery-50/30': isVerified }"
  >
    <div class="flex items-center gap-4">
      <button 
        type="button"
        @click="handleCheck"
        class="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden group"
        :class="[
          isVerified 
            ? 'bg-bakery-500 border-bakery-500' 
            : 'bg-white border-bakery-200 hover:border-bakery-400'
        ]"
      >
        <div v-if="isVerifying" class="w-4 h-4 border-2 border-bakery-500 border-t-transparent rounded-full animate-spin"></div>
        <Check v-else-if="isVerified" class="w-5 h-5 text-white animate-in zoom-in duration-300" />
        <div v-else class="w-full h-full opacity-0 group-hover:opacity-10 transition-opacity bg-bakery-500"></div>
      </button>
      
      <span class="text-sm font-bold text-bakery-700 tracking-tight">
        {{ t('auth.captchaLabel') }}
      </span>
    </div>

    <div class="flex flex-col items-end opacity-40">
      <ShieldCheck class="w-6 h-6 text-bakery-900" />
      <span class="text-[8px] font-black uppercase tracking-tighter text-bakery-900 mt-1">SimpleProtect</span>
    </div>
  </div>
</template>

<style scoped>
.glass-effect {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>
