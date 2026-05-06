<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useChat, type ChatMessage } from '../composables/useChat';
import { useAuth } from '../composables/useAuth';
import { socketService } from '../services/socket';
import { MessageSquare, X, Send, Clock, User, Sparkles } from 'lucide-vue-next';
import { useChatUI } from '../composables/useChatUI';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

const { messages: liveMessages, sendMessage, fetchHistory } = useChat();
const { user } = useAuth();
const { activeChat, toggleSupportChat, closeAll } = useChatUI();

const isOpen = computed(() => activeChat.value === 'SUPPORT');
const userInput = ref('');
const messageContainer = ref<HTMLElement | null>(null);

const displayMessages = computed(() => {
    // Transform liveMessages to UI format
    const history = liveMessages.value.map(msg => ({
        id: msg.id,
        type: msg.sender_id === user.value?.id ? 'user' : 'support',
        text: msg.message,
        time: msg.created_at
    }));
    return history;
});

const isVisible = computed(() => {
    // Hide for Admin and Manager roles
    if (!user.value) return true; // Show for guests so they can be prompted to login
    return !['Admin', 'Manager'].includes(user.value.role);
});

const toggleChat = async () => {
    if (!user.value) {
        alert('Please login to chat with live support');
        return;
    }
    
    toggleSupportChat();
    if (isOpen.value) {
        await fetchHistory('SUPPORT');
        scrollToBottom();
    }
};

const closeChat = () => {
    closeAll();
};

const handleIncomingMessage = (newMessage: ChatMessage) => {
    if (!liveMessages.value.some(m => m.id === newMessage.id)) {
        liveMessages.value.push(newMessage);
        if (isOpen.value) scrollToBottom();
    }
};

const showQuickActions = ref(true);

const quickOptions = computed(() => [
    { text: t('support.hours'), icon: '⏰', message: t('support.hoursMsg') },
    { text: t('support.orderStatus'), icon: '🚚', message: t('support.orderStatusMsg') },
    { text: t('support.customCakes'), icon: '🎂', message: t('support.customCakesMsg') },
    { text: t('support.createOrder'), icon: '📝', message: t('support.createOrderMsg'), isOrderRequest: true }
]);

const handleSend = () => {
    if (!userInput.value.trim()) return;
    sendMessage(null, userInput.value);
    userInput.value = '';
    showQuickActions.value = false;
};

const handleQuickAction = (opt: any) => {
    sendMessage(null, opt.message);
    showQuickActions.value = false;
};

onMounted(() => {
    socketService.on('message:receive', handleIncomingMessage);
    if (user.value) {
        fetchHistory('SUPPORT');
    }
});

onUnmounted(() => {
    socketService.off('message:receive', handleIncomingMessage);
});

const scrollToBottom = async () => {
    await nextTick();
    if (messageContainer.value) {
        messageContainer.value.scrollTo({
            top: messageContainer.value.scrollHeight,
            behavior: 'smooth'
        });
    }
};

watch(displayMessages, () => { if (isOpen.value) scrollToBottom(); }, { deep: true });
</script>

<template>
  <div v-if="isVisible" class="fixed bottom-4 md:bottom-24 right-4 md:right-6 z-100 flex flex-col items-end">
    <!-- Support Toggle Button -->
    <button
      @click="toggleChat"
      class="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-accent-gold text-bakery-900 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative animate-bounce-subtle"
      title="Live Support"
    >
      <MessageSquare v-if="!isOpen" class="w-5 h-5 md:w-6 md:h-6" />
      <X v-else class="w-5 h-5 md:w-6 md:h-6" />
      
      <!-- Notification Dot -->
      <div v-if="!isOpen && liveMessages.length > 0" class="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-500 rounded-full border-2 border-white"></div>
    </button>

    <!-- Support Window -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-10 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-10 opacity-0 scale-95"
    >
      <div v-if="isOpen" class="absolute bottom-16 md:bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-bakery-100 max-h-[60vh]">
        <!-- Header -->
        <div class="bg-accent-gold p-4 text-bakery-900 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-bakery-900/10 flex items-center justify-center">
              <User class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-black text-xs uppercase tracking-widest">{{ t('support.liveSupport') }}</h3>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-bakery-900 rounded-full animate-pulse"></span>
                <span class="text-[9px] font-bold opacity-70">Agent Online</span>
              </div>
            </div>
          </div>
          <button @click="closeChat" class="p-2 hover:bg-bakery-900/10 rounded-xl transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Messages Area -->
        <div ref="messageContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-hide">
          <div v-if="displayMessages.length === 0" class="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div class="w-16 h-16 bg-accent-gold/20 rounded-full flex items-center justify-center">
              <MessageSquare class="w-8 h-8 text-accent-gold" />
            </div>
            <p class="text-xs text-gray-500 font-medium">{{ t('support.welcomeMsg') }}</p>
          </div>
          <div
            v-for="msg in displayMessages"
            :key="msg.id"
            :class="['flex flex-col', msg.type === 'user' ? 'items-end' : 'items-start']"
          >
            <div
              :class="[
                'max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm',
                msg.type === 'user'
                  ? 'bg-bakery-900 text-white rounded-tr-none'
                  : 'bg-white text-bakery-900 border border-bakery-100 rounded-tl-none'
              ]"
            >
              {{ msg.text }}
            </div>
            <div class="text-[8px] text-gray-400 mt-1 px-1 flex items-center gap-0.5">
                <Clock class="w-2.5 h-2.5" />
                {{ new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform translate-y-2 opacity-0"
        >
          <div v-if="showQuickActions" class="px-4 py-3 bg-white border-t border-bakery-50">
            <div class="flex items-center gap-1.5 mb-2.5">
              <Sparkles class="w-3 h-3 text-accent-gold" />
              <span class="text-[10px] font-black uppercase tracking-widest text-bakery-400">{{ t('support.quickHelp') }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="opt in quickOptions" 
                :key="opt.text"
                @click="handleQuickAction(opt)"
                class="flex flex-col items-start p-2.5 rounded-xl border border-bakery-100 bg-bakery-50/30 hover:border-accent-gold hover:bg-accent-gold/5 transition-all text-left group"
              >
                <span class="text-lg mb-1 group-hover:scale-110 transition-transform">{{ opt.icon }}</span>
                <span class="text-[9px] font-bold text-bakery-700 leading-tight">{{ opt.text }}</span>
              </button>
            </div>
          </div>
        </Transition>

        <!-- Input Area -->
        <div class="p-3 bg-white border-t border-bakery-50">
          <form @submit.prevent="handleSend" class="flex items-center gap-2">
            <button 
              type="button"
              @click="showQuickActions = !showQuickActions"
              class="p-2.5 rounded-xl border transition-all"
              :class="showQuickActions ? 'bg-accent-gold border-accent-gold text-bakery-900' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-bakery-900'"
              title="Toggle Quick Actions"
            >
              <Sparkles class="w-4 h-4" />
            </button>
            <input
              v-model="userInput"
              type="text"
              :placeholder="t('support.inputPlaceholder')"
              class="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all"
            />
            <button
              type="submit"
              :disabled="!userInput.trim()"
              class="p-2.5 bg-accent-gold text-bakery-900 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-30 disabled:hover:scale-100"
            >
              <Send class="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
