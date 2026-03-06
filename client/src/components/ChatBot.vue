<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';

interface Message {
  id: number;
  type: 'bot' | 'user';
  text: string;
}

interface QnA {
  question: string;
  answer: string;
  category: string;
}

const qnaData: QnA[] = [
  // About Us
  {
    category: 'About Us',
    question: 'What is the Bakery Management System?',
    answer: 'An all-in-one platform for bakeries to manage products, orders, customers, and staff efficiently.'
  },
  {
    category: 'About Us',
    question: 'What are the main features?',
    answer: 'Key features include real-time order tracking, inventory management, sales reports, and seamless customer checkout.'
  },
  {
    category: 'About Us',
    question: 'Who can use this system?',
    answer: 'Both customers (to order online) and staff or managers (to manage products, orders, and reports).'
  },

  // How-to
  {
    category: 'How-to',
    question: 'How do I place an order?',
    answer: 'Browse the menu, add items to your cart, and proceed to checkout. Choose "Order at Shop" or delivery.'
  },
  {
    category: 'How-to',
    question: 'How do I see the product menu?',
    answer: 'Scroll to the "Our Menu" section on the landing page or click the "Shop Now" button.'
  },
  {
    category: 'How-to',
    question: 'How do I track my order?',
    answer: 'Go to "My Orders" in your account to see real-time status updates for all your orders.'
  },
  {
    category: 'How-to',
    question: 'How do I pay for my order?',
    answer: 'After placing an order, go to "My Orders", open the unpaid order, and click "Pay Now" to complete payment via QR code.'
  },

  // Coupons
  {
    category: 'Coupons',
    question: 'How do I find available coupons?',
    answer: 'Go to Account Settings and open the "Coupon" tab to view all available discount codes.'
  },
  {
    category: 'Coupons',
    question: 'How do I use a coupon?',
    answer: 'During checkout, enter your coupon code in the discount field and click "Apply" to see the discount reflected.'
  },
  {
    category: 'Coupons',
    question: 'Why is my coupon not working?',
    answer: 'Check that the coupon code is correct, not expired, and meets any minimum order requirements.'
  },
  {
    category: 'Coupons',
    question: 'Can I use multiple coupons at once?',
    answer: 'Only one coupon can be applied per order at this time.'
  },

  // Employee Guide
  {
    category: 'Employee Guide',
    question: 'How do I add a new product?',
    answer: 'Go to "Products Manager" in the dashboard, click "Add Product", fill in the details, and upload an image.'
  },
  {
    category: 'Employee Guide',
    question: 'How can I see today\'s revenue?',
    answer: 'Visit the "Reports" section in the dashboard for a real-time summary of sales and revenue.'
  },
  {
    category: 'Employee Guide',
    question: 'How to manage order status?',
    answer: 'In the "Orders" dashboard view, update each order from "Pending" → "Baking" → "Completed".'
  },
  {
    category: 'Employee Guide',
    question: 'How do I manage inventory?',
    answer: 'Use the "Inventory" section to view stock levels and adjust quantities using the inline slider or edit modal.'
  },
];

const isOpen = ref(false);
const userInput = ref('');
const isBaking = ref(false);
// Hides QnA as soon as the user sends any question; can be toggled back
const questionAsked = ref(false);
const showQnA = ref(true);

const messages = ref<Message[]>([
  { id: 1, type: 'bot', text: 'Hello! I\'m your Bakery AI Assistant 🥐 Choose a topic or ask me anything!' }
]);
const messageContainer = ref<HTMLElement | null>(null);

const categories = computed(() => [...new Set(qnaData.map(item => item.category))]);
const currentCategory = ref<string | null>(null);

const filteredQuestions = computed(() => {
  if (!currentCategory.value) return [];
  return qnaData.filter(item => item.category === currentCategory.value);
});

const toggleQnA = () => {
  showQnA.value = !showQnA.value;
};

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const selectCategory = (category: string) => {
  currentCategory.value = category;
  messages.value.push({
    id: Date.now(),
    type: 'user',
    text: `Tell me about ${category}`
  });

  setTimeout(() => {
    messages.value.push({
      id: Date.now() + 1,
      type: 'bot',
      text: `Here are common questions about ${category}:`
    });
  }, 400);
};

const sendToAI = async (text: string) => {
  if (!text.trim() || isBaking.value) return;

  // Hide QnA immediately when user sends a question
  questionAsked.value = true;
  showQnA.value = false;

  const userMessage: Message = {
    id: Date.now(),
    type: 'user',
    text: text
  };

  if (userInput.value === text) {
    userInput.value = '';
  }

  messages.value.push(userMessage);
  isBaking.value = true;

  try {
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: text,
        history: (() => {
          let h = messages.value.slice(-6).map(m => ({
            role: m.type === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }));
          const firstUserIdx = h.findIndex(m => m.role === 'user');
          return firstUserIdx !== -1 ? h.slice(firstUserIdx) : [];
        })()
      })
    });

    const data = await response.json();

    messages.value.push({
      id: Date.now() + 1,
      type: 'bot',
      text: data.text || "Sorry, I'm having trouble right now. 🥖"
    });

  } catch (error) {
    console.error('AI Error:', error);
    messages.value.push({
      id: Date.now() + 1,
      type: 'bot',
      text: "Oops! Please try again later. 🥯"
    });
  } finally {
    isBaking.value = false;
  }
};

const selectQuestion = (qna: QnA) => {
  sendToAI(qna.question);
};

const resetChat = () => {
  currentCategory.value = null;
  questionAsked.value = false;
  showQnA.value = true;
  messages.value = [
    { id: Date.now(), type: 'bot', text: 'How else can I help you? Choose a topic below:' }
  ];
};

const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTo({
      top: messageContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

watch(messages, () => { scrollToBottom(); }, { deep: true });
watch(currentCategory, () => { scrollToBottom(); });
watch(isOpen, (newVal) => { if (newVal) scrollToBottom(); });
</script>

<template>
  <div class="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-100 flex flex-col items-end">
    <!-- Chat Toggle Button -->
    <button
      @click="toggleChat"
      class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-bakery-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative animate-float"
      :class="{ 'rotate-90': isOpen }"
    >
      <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>

      <!-- Notification Dot -->
      <div v-if="!isOpen" class="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-accent-gold rounded-full border-2 border-white animate-pulse"></div>
    </button>

    <!-- Chat Window -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-10 -translate-y-10 opacity-0 scale-95"
      enter-to-class="transform translate-x-0 translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0 translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-x-10 -translate-y-10 opacity-0 scale-95"
    >
      <div v-if="isOpen" class="absolute bottom-16 md:bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-80 md:w-96 glass-card rounded-4xl md:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[70vh] ring-1 ring-bakery-900/5">
        <!-- Header -->
        <div class="bg-bakery-900 p-6 text-white flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
            🥐
          </div>
          <div>
            <h3 class="font-black text-sm uppercase tracking-widest">Bakery Assistant</h3>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span class="text-[10px] font-bold opacity-70">Always Baking Answers</span>
            </div>
          </div>
          <button @click="resetChat" class="ml-auto p-2 hover:bg-white/10 rounded-xl transition-colors" title="Reset Chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>

        <!-- Messages Area -->
        <div ref="messageContainer" class="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-white/50">
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['flex', msg.type === 'user' ? 'justify-end' : 'justify-start']"
          >
            <div
              :class="[
                'max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed',
                msg.type === 'user'
                  ? 'bg-bakery-600 text-white rounded-tr-none'
                  : 'bg-white text-bakery-900 shadow-sm border border-bakery-100 rounded-tl-none'
              ]"
            >
              {{ msg.text }}
            </div>
          </div>

          <!-- Baking Loader -->
          <div v-if="isBaking" class="flex justify-start">
            <div class="bg-white text-bakery-400 p-4 rounded-3xl rounded-tl-none shadow-sm border border-bakery-100 flex items-center gap-2">
              <span class="text-xs font-medium italic">Baking response...</span>
              <div class="flex gap-1">
                <span class="w-1.5 h-1.5 bg-bakery-300 rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-bakery-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 bg-bakery-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- QnA Options Area — hidden once an answer is generated -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div v-if="showQnA" class="p-6 pt-0 bg-white/50 space-y-3">
            <!-- Category Selection -->
            <div v-if="!currentCategory" class="flex flex-col gap-2">
              <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400 px-2 mb-1">Choose a topic</p>
              <button
                v-for="cat in categories"
                :key="cat"
                @click="selectCategory(cat)"
                class="w-full text-left p-4 rounded-2xl bg-white border border-bakery-100 hover:border-bakery-600 hover:bg-bakery-50 transition-all text-xs font-bold text-bakery-700 flex items-center justify-between group"
              >
                <span class="flex items-center gap-2">
                  <span v-if="cat === 'Coupons'">🏷️</span>
                  <span v-else-if="cat === 'How-to'">📖</span>
                  <span v-else-if="cat === 'About Us'">🏪</span>
                  <span v-else>👷</span>
                  {{ cat }}
                </span>
                <svg class="group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>

            <!-- Question Selection -->
            <div v-else class="flex flex-col gap-2">
              <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400 px-2 mb-1">{{ currentCategory }}</p>
              <div class="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                <button
                  v-for="qna in filteredQuestions"
                  :key="qna.question"
                  @click="selectQuestion(qna)"
                  class="w-full text-left p-4 rounded-2xl bg-bakery-50 border border-transparent hover:border-bakery-200 transition-all text-xs font-medium text-bakery-900"
                >
                  {{ qna.question }}
                </button>
                <button
                  @click="currentCategory = null"
                  class="w-full text-center p-3 text-[10px] font-black uppercase tracking-widest text-bakery-400 hover:text-bakery-600"
                >
                  ← Back to Topics
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-bakery-100">
          <form @submit.prevent="sendToAI(userInput)" class="relative flex items-center gap-2">
            <!-- Toggle QnA button — only visible after first question -->
            <button
              v-if="questionAsked"
              type="button"
              @click="toggleQnA"
              :title="showQnA ? 'Hide topics' : 'Show topics'"
              class="shrink-0 p-2.5 rounded-2xl border transition-all text-xs font-bold"
              :class="showQnA
                ? 'bg-bakery-600 text-white border-bakery-600'
                : 'bg-bakery-50 text-bakery-500 border-bakery-100 hover:border-bakery-400 hover:text-bakery-700'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            </button>
            <input
              v-model="userInput"
              type="text"
              placeholder="Ask anything about our bakery..."
              class="w-full bg-bakery-50/50 border border-bakery-100 rounded-2xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-600/20 focus:border-bakery-600 transition-all"
              :disabled="isBaking"
            />
            <button
              type="submit"
              :disabled="!userInput.trim() || isBaking"
              class="absolute right-2 p-2 text-bakery-600 hover:bg-bakery-100 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 bg-bakery-50/50 border-t border-bakery-100 flex items-center justify-between">
          <p class="text-[9px] font-black uppercase tracking-[0.2em] text-bakery-300">Powered by Gemini AI • v2.0</p>
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

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
