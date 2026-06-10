<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

import { useChatUI } from '../composables/useChatUI';
import { BASE_URL } from '../config/api';

const { t, currentLocale } = useI18n();
const { activeChat, toggleAIChat } = useChatUI();

interface Message {
  id: number;
  type: 'bot' | 'user';
  text: string;
}

interface QnA {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const qnaData = computed<QnA[]>(() => {
  const categories = {
    about: t('chatbot.categories.aboutUs'),
    howto: t('chatbot.categories.howto'),
    coupons: t('chatbot.categories.coupons'),
    employee: t('chatbot.categories.employeeGuide')
  };

  if (currentLocale.value === 'jp') {
    return [
      { id: 'about_1', category: categories.about, question: 'ベーカリー管理システムとは何ですか？', answer: 'パン屋さんが商品、注文、顧客、スタッフを効率的に管理するためのオールインワン・プラットフォームです。' },
      { id: 'about_2', category: categories.about, question: '主な機能は何ですか？', answer: 'リアルタイムの注文追跡、在庫管理、売上レポート、シームレスな顧客チェックアウトなどが含まれます。' },
      { id: 'about_3', category: categories.about, question: '誰がこのシステムを使えますか？', answer: 'お客様（オンライン注文用）とスタッフまたはマネージャー（管理用）の両方が利用できます。' },
      { id: 'howto_1', category: categories.howto, question: '注文はどうすればいいですか？', answer: 'メニューを閲覧し、商品をカートに追加してチェックアウトに進んでください。「店舗で注文」または配送を選択できます。' },
      { id: 'howto_2', category: categories.howto, question: '商品メニューはどこで見られますか？', answer: 'ランディングページの「メニュー」セクションまでスクロールするか、「今すぐ購入」ボタンをクリックしてください。' },
      { id: 'howto_3', category: categories.howto, question: '注文の追跡はできますか？', answer: 'アカウントの「マイオーダー」から、すべての注文のリアルタイムなステータスを確認できます。' },
      { id: 'howto_4', category: categories.howto, question: '支払い方法を教えてください。', answer: '注文後、「マイオーダー」から未払いの注文を開き、「今すぐ支払う」をクリックしてQRコードで支払いを完了してください。' },
      { id: 'coupon_1', category: categories.coupons, question: '利用可能なクーポンはどこにありますか？', answer: 'アカウント設定の「クーポン」タブから、利用可能なすべての割引コードを確認できます。' },
      { id: 'coupon_2', category: categories.coupons, question: 'クーポンの使い方は？', answer: 'チェックアウト時に割引フィールドにクーポンコードを入力し、「適用」をクリックすると割引が反映されます。' },
      { id: 'coupon_3', category: categories.coupons, question: 'クーポンが使えません。', answer: 'コードが正しいか、有効期限が切れていないか、最低注文金額などの条件を満たしているか確認してください。' },
      { id: 'employee_1', category: categories.employee, question: '新商品の追加方法は？', answer: 'ダッシュボードの「商品管理」から「商品を追加」をクリックし、詳細を入力して画像をアップロードしてください。' },
      { id: 'employee_2', category: categories.employee, question: '今日の売上を確認したいです。', answer: 'ダッシュボードの「レポート」セクションで、売上と収益のリアルタイムな概要を確認できます。' },
      { id: 'howto_5', category: categories.howto, question: '配送状況はどうやって確認しますか？', answer: '「注文履歴」から該当する注文を選択すると、リアルタイムの配送ステータスと追跡番号を確認できます。' },
      { id: 'howto_6', category: categories.howto, question: 'プロフィールにはどうやってアクセスしますか？', answer: 'ナビゲーションメニューの「アカウント」または「プロフィール」をクリックして、設定を管理できます。' },
      { id: 'about_4', category: categories.about, question: 'マネージャーに連絡するにはどうすればいいですか？', answer: 'manager@theartisanbakery.com までメールをお送りいただくか、「ストーリー」ページの問い合わせフォームをご利用ください。' }
    ];
  } else if (currentLocale.value === 'vn') {
    return [
      { id: 'about_1', category: categories.about, question: 'Hệ thống quản lý tiệm bánh là gì?', answer: 'Là nền tảng tất cả trong một giúp tiệm bánh quản lý sản phẩm, đơn hàng, khách hàng và nhân viên hiệu quả.' },
      { id: 'about_2', category: categories.about, question: 'Các tính năng chính là gì?', answer: 'Bao gồm theo dõi đơn hàng thời gian thực, quản lý kho, báo cáo bán hàng và thanh toán nhanh chóng.' },
      { id: 'about_3', category: categories.about, question: 'Ai có thể sử dụng hệ thống này?', answer: 'Cả khách hàng (để đặt hàng) và nhân viên hoặc quản lý (để quản lý hoạt động).' },
      { id: 'howto_1', category: categories.howto, question: 'Làm thế nào để đặt hàng?', answer: 'Xem thực đơn, thêm món vào giỏ hàng và thanh toán. Chọn "Đặt tại quầy" hoặc giao hàng.' },
      { id: 'howto_2', category: categories.howto, question: 'Xem menu sản phẩm ở đâu?', answer: 'Cuộn xuống phần "Thực đơn" trên trang chủ hoặc nhấn nút "Mua ngay".' },
      { id: 'howto_3', category: categories.howto, question: 'Làm sao để theo dõi đơn hàng?', answer: 'Vào phần "Đơn hàng của tôi" trong tài khoản để xem trạng thái cập nhật thời gian thực.' },
      { id: 'howto_4', category: categories.howto, question: 'Thanh toán đơn hàng như thế nào?', answer: 'Sau khi đặt hàng, vào "Đơn hàng của tôi", mở đơn chưa thanh toán và nhấn "Thanh toán ngay" qua mã QR.' },
      { id: 'coupon_1', category: categories.coupons, question: 'Tìm mã giảm giá ở đâu?', answer: 'Vào Cài đặt tài khoản và mở tab "Ưu đãi của tôi" để xem các mã giảm giá hiện có.' },
      { id: 'coupon_2', category: categories.coupons, question: 'Cách sử dụng mã giảm giá?', answer: 'Khi thanh toán, nhập mã vào ô giảm giá và nhấn "Áp dụng" để thấy số tiền được giảm.' },
      { id: 'employee_1', category: categories.employee, question: 'Làm thế nào để thêm sản phẩm mới?', answer: 'Vào "Quản lý sản phẩm", nhấn "Thêm sản phẩm", điền thông tin và tải ảnh lên.' },
      { id: 'employee_2', category: categories.employee, question: 'Xem doanh thu hôm nay ở đâu?', answer: 'Truy cập phần "Báo cáo" để xem tóm tắt doanh thu và doanh số bán hàng.' },
      { id: 'howto_5', category: categories.howto, question: 'Làm thế nào để kiểm tra quá trình giao hàng?', answer: 'Vào "Đơn hàng của tôi", chọn đơn hàng của bạn để xem trạng thái giao hàng và mã vận đơn thời gian thực.' },
      { id: 'howto_6', category: categories.howto, question: 'Làm thế nào để truy cập hồ sơ của tôi?', answer: 'Nhấn vào "Tài khoản" hoặc "Hồ sơ" trên thanh điều hướng để quản lý thông tin cá nhân.' },
      { id: 'about_4', category: categories.about, question: 'Làm sao để liên hệ với quản lý tiệm bánh?', answer: 'Bạn có thể gửi email đến manager@theartisanbakery.com hoặc sử dụng biểu mẫu liên hệ trong trang "Câu chuyện".' }
    ];
  }

  // Default English
  return [
    { id: 'about_1', category: categories.about, question: 'What is the Bakery Management System?', answer: 'An all-in-one platform for bakeries to manage products, orders, customers, and staff efficiently.' },
    { id: 'about_2', category: categories.about, question: 'What are the main features?', answer: 'Key features include real-time order tracking, inventory management, sales reports, and seamless customer checkout.' },
    { id: 'about_3', category: categories.about, question: 'Who can use this system?', answer: 'Both customers (to order online) and staff or managers (to manage products, orders, and reports).' },
    { id: 'howto_1', category: categories.howto, question: 'How do I place an order?', answer: 'Browse the menu, add items to your cart, and proceed to checkout. Choose "Order at Shop" or delivery.' },
    { id: 'howto_2', category: categories.howto, question: 'How do I see the product menu?', answer: 'Scroll to the "Our Menu" section on the landing page or click the "Shop Now" button.' },
    { id: 'howto_3', category: categories.howto, question: 'How do I track my order?', answer: 'Go to "My Orders" in your account to see real-time status updates for all your orders.' },
    { id: 'howto_4', category: categories.howto, question: 'How do I pay for my order?', answer: 'After placing an order, go to "My Orders", open the unpaid order, and click "Pay Now" to complete payment via QR code.' },
    { id: 'coupon_1', category: categories.coupons, question: 'How do I find available coupons?', answer: 'Go to Account Settings and open the "Coupon" tab to view all available discount codes.' },
    { id: 'coupon_2', category: categories.coupons, question: 'How do I use a coupon?', answer: 'During checkout, enter your coupon code in the discount field and click "Apply" to see the discount reflected.' },
    { id: 'employee_1', category: categories.employee, question: 'How do I add a new product?', answer: 'Go to "Products Manager" in the dashboard, click "Add Product", fill in the details, and upload an image.' },
    { id: 'employee_2', category: categories.employee, question: 'How can I see today\'s revenue?', answer: 'Visit the "Reports" section in the dashboard for a real-time summary of sales and revenue.' },
    { id: 'howto_5', category: categories.howto, question: 'How do I check my delivery status?', answer: 'Go to "My Orders", select your order, and you will see the real-time delivery status and tracking number.' },
    { id: 'howto_6', category: categories.howto, question: 'How do I access my profile?', answer: 'Click on the "Account" or "Profile" link in the top navigation menu to manage your settings.' },
    { id: 'about_4', category: categories.about, question: 'How do I contact the bakery manager?', answer: 'You can contact the manager by emailing manager@theartisanbakery.com or using the contact form in our "Our Story" page.' }
  ];
});

const isOpen = computed(() => activeChat.value === 'AI');
const userInput = ref('');
const isBaking = ref(false);
const questionAsked = ref(false);
const showQnA = ref(true);

const messages = ref<Message[]>([]);

onMounted(() => {
  messages.value = [
    { id: 1, type: 'bot', text: t('chatbot.welcome') }
  ];
});

const messageContainer = ref<HTMLElement | null>(null);

const categories = computed(() => [...new Set(qnaData.value.map(item => item.category))]);
const currentCategory = ref<string | null>(null);

const filteredQuestions = computed(() => {
  if (!currentCategory.value) return [];
  return qnaData.value.filter(item => item.category === currentCategory.value);
});

const toggleQnA = () => {
  showQnA.value = !showQnA.value;
};

const toggleChat = () => {
  toggleAIChat();
};

const selectCategory = (category: string) => {
  currentCategory.value = category;
  messages.value.push({
    id: Date.now(),
    type: 'user',
    text: t('chatbot.tellMeAbout').replace('{category}', category)
  });

  setTimeout(() => {
    messages.value.push({
      id: Date.now() + 1,
      type: 'bot',
      text: t('chatbot.commonQuestions').replace('{category}', category)
    });
  }, 400);
};

const sendToAI = async (text: string) => {
  if (!text.trim() || isBaking.value) return;

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
    const baseUrl = BASE_URL;
    const response = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: text,
        language: currentLocale.value,
        history: (() => {
          // Exclude the current active prompt message that we just pushed to messages.value
          const priorMessages = messages.value.slice(0, -1);
          let h = priorMessages.slice(-6).map(m => ({
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
      text: data.text || data.message || t('chatbot.errorAI')
    });

  } catch (error) {
    console.error('AI Error:', error);
    messages.value.push({
      id: Date.now() + 1,
      type: 'bot',
      text: t('chatbot.errorGeneric')
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
    { id: Date.now(), type: 'bot', text: t('chatbot.howElse') }
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
watch(currentLocale, () => { resetChat(); });
</script>

<template>
  <div class="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-100 flex flex-col items-end">
    <!-- Chat Toggle Button -->
    <button
      @click="toggleChat"
      class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-bakery-900 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative animate-float"
      :class="{ 'rotate-90': isOpen }"
    >
      <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
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
      <div v-if="isOpen" class="absolute bottom-16 md:bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-80 md:w-96 glass-card rounded-4xl md:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[calc(100svh-7rem)] md:max-h-[70vh] ring-1 ring-bakery-900/5 shadow-2xl">
        <!-- Header -->
        <div class="bg-bakery-900 p-6 text-white flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
            🥐
          </div>
          <div>
            <h3 class="font-black text-sm uppercase tracking-widest">{{ t('chatbot.title') }}</h3>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span class="text-[10px] font-bold opacity-70">{{ t('chatbot.status') }}</span>
            </div>
          </div>
          <button @click="resetChat" class="ml-auto p-2 hover:bg-white/10 rounded-xl transition-colors" :title="t('chatbot.resetTitle')">
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
                  ? 'bg-bakery-900 text-white rounded-tr-none'
                  : 'bg-white text-bakery-900 shadow-sm border border-bakery-100 rounded-tl-none'
              ]"
            >
              {{ msg.text }}
            </div>
          </div>

          <div v-if="isBaking" class="flex justify-start">
            <div class="bg-white text-bakery-400 p-4 rounded-3xl rounded-tl-none shadow-sm border border-bakery-100 flex items-center gap-2">
              <span class="text-xs font-medium italic">{{ t('chatbot.baking') }}</span>
              <div class="flex gap-1">
                <span class="w-1.5 h-1.5 bg-bakery-300 rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-bakery-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 bg-bakery-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- QnA Options Area -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div v-if="showQnA" class="p-6 pt-0 bg-white/50 space-y-3">
            <div v-if="!currentCategory" class="flex flex-col gap-2">
              <p class="text-[10px] font-black uppercase tracking-widest text-bakery-400 px-2 mb-1">{{ t('chatbot.chooseTopic') }}</p>
              <button
                v-for="cat in categories"
                :key="cat"
                @click="selectCategory(cat)"
                class="w-full text-left p-4 rounded-2xl bg-white border border-bakery-100 hover:border-bakery-900 hover:bg-bakery-50 transition-all text-xs font-bold text-bakery-700 flex items-center justify-between group"
              >
                 <span class="flex items-center gap-2">
                  <span v-if="cat === t('chatbot.categories.coupons')">🏷️</span>
                  <span v-else-if="cat === t('chatbot.categories.howto')">📖</span>
                  <span v-else-if="cat === t('chatbot.categories.aboutUs')">🏪</span>
                  <span v-else>👷</span>
                  {{ cat }}
                </span>
                <svg class="group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>

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
                  ← {{ t('chatbot.backToTopics') }}
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-bakery-100">
          <form @submit.prevent="sendToAI(userInput)" class="relative flex items-center gap-2">
            <button
              v-if="questionAsked"
              type="button"
              @click="toggleQnA"
              :title="showQnA ? t('chatbot.hideTopics') : t('chatbot.showTopics')"
              class="shrink-0 p-2.5 rounded-2xl border transition-all text-xs font-bold"
              :class="showQnA
                ? 'bg-bakery-900 text-white border-bakery-900'
                : 'bg-bakery-50 text-bakery-500 border-bakery-100 hover:border-bakery-400 hover:text-bakery-700'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            </button>
            <input
              v-model="userInput"
              type="text"
              :placeholder="t('chatbot.placeholder')"
              class="w-full bg-bakery-50/50 border border-bakery-100 rounded-2xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-900/10 focus:border-bakery-900 transition-all"
              :disabled="isBaking"
            />
            <button
              type="submit"
              :disabled="!userInput.trim() || isBaking"
              class="absolute right-2 p-2 text-bakery-900 hover:bg-bakery-100 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 bg-bakery-50/50 border-t border-bakery-100 flex items-center justify-between">
          <p class="text-[9px] font-black uppercase tracking-[0.2em] text-bakery-300">{{ t('chatbot.poweredBy') }}</p>
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

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}
</style>
