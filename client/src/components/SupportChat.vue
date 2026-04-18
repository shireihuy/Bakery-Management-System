<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useChat, type ChatMessage } from '../composables/useChat';
import { useAuth } from '../composables/useAuth';
import { socketService } from '../services/socket';
import { MessageSquare, X, Send, Clock, User } from 'lucide-vue-next';

const { messages: liveMessages, sendMessage, fetchHistory } = useChat();
const { user } = useAuth();

const isOpen = ref(false);
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
    
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        await fetchHistory('SUPPORT');
        scrollToBottom();
    }
};

const handleIncomingMessage = (newMessage: ChatMessage) => {
    if (!liveMessages.value.some(m => m.id === newMessage.id)) {
        liveMessages.value.push(newMessage);
        if (isOpen.value) scrollToBottom();
    }
};

const handleSend = () => {
    if (!userInput.value.trim()) return;
    sendMessage(null, userInput.value);
    userInput.value = '';
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
              <h3 class="font-black text-xs uppercase tracking-widest">Live Support</h3>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-bakery-900 rounded-full animate-pulse"></span>
                <span class="text-[9px] font-bold opacity-70">Agent Online</span>
              </div>
            </div>
          </div>
          <button @click="isOpen = false" class="p-2 hover:bg-bakery-900/10 rounded-xl transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Messages Area -->
        <div ref="messageContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          <div v-if="displayMessages.length === 0" class="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div class="w-16 h-16 bg-accent-gold/20 rounded-full flex items-center justify-center">
              <MessageSquare class="w-8 h-8 text-accent-gold" />
            </div>
            <p class="text-xs text-gray-500 font-medium">How can we help you today? Send us a message and our team will get back to you shortly.</p>
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

        <!-- Input Area -->
        <div class="p-3 bg-white border-t border-bakery-50">
          <form @submit.prevent="handleSend" class="flex items-center gap-2">
            <input
              v-model="userInput"
              type="text"
              placeholder="Ask support anything..."
              class="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all"
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
</style>
