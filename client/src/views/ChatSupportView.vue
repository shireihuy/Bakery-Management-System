<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { 
    Search, 
    Send,
    User,
    MessageSquare,
    Clock,
    PlusCircle,
    ShoppingBag,
    Trash2,
    X
} from 'lucide-vue-next';
import { useChat, type Conversation, type ChatMessage } from '../composables/useChat';
import { useAuth } from '../composables/useAuth';
import { socketService } from '../services/socket';
import { useProducts } from '../composables/useProducts';
import { useOrders } from '../composables/useOrders';
import { useCurrency } from '../composables/useCurrency';

const { conversations, messages, fetchConversations, fetchHistory, sendMessage, joinAdminRoom } = useChat();
const { user } = useAuth();
const { products, fetchProducts } = useProducts();
const { addOrder } = useOrders();
const { formatPrice } = useCurrency();

const selectedConversation = ref<Conversation | null>(null);
const searchQuery = ref('');
const newMessage = ref('');
const messageContainer = ref<HTMLElement | null>(null);

// Order Creation Modal State
const isOrderModalOpen = ref(false);
const orderItems = ref<any[]>([]);
const isSubmittingOrder = ref(false);

const openOrderModal = async () => {
    await fetchProducts();
    orderItems.value = [];
    isOrderModalOpen.value = true;
};

const addToOrder = (product: any) => {
    const existing = orderItems.value.find(i => i.productId === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        orderItems.value.push({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: 1
        });
    }
};

const removeFromOrder = (productId: number) => {
    orderItems.value = orderItems.value.filter(i => i.productId !== productId);
};

const orderTotal = computed(() => orderItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0));

const handleCreateOrder = async () => {
    if (!selectedConversation.value || orderItems.value.length === 0) return;
    
    isSubmittingOrder.value = true;
    try {
        await addOrder({
            customerId: selectedConversation.value.id,
            customerName: selectedConversation.value.name,
            customerEmail: selectedConversation.value.email,
            items: orderItems.value,
            total: orderTotal.value,
            deliveryType: 'Pick-up'
        });
        
        // Notify user in chat
        sendMessage(selectedConversation.value.id, `✅ I have created a new order (#...) for you as requested! You can find it in your "My Orders" section.`);
        
        isOrderModalOpen.value = false;
        orderItems.value = [];
    } catch (err) {
        alert('Failed to create order: ' + (err as Error).message);
    } finally {
        isSubmittingOrder.value = false;
    }
};

const isOrderRequest = (text: string) => {
    const keywords = ['create a new order', 'create an order', 'place an order', 'help me order'];
    return keywords.some(k => text.toLowerCase().includes(k));
};

const filteredConversations = computed(() => {
    return conversations.value.filter(c => 
        (c.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const selectConversation = async (conv: Conversation) => {
    console.log('Selected conversation:', conv);
    selectedConversation.value = conv;
    await fetchHistory(conv.id);
    scrollToBottom();
};

const handleSend = () => {
    if (!selectedConversation.value || !newMessage.value.trim()) return;
    console.log('Sending message to:', selectedConversation.value.id);
    sendMessage(selectedConversation.value.id, newMessage.value);
    newMessage.value = '';
};

const scrollToBottom = async () => {
    await nextTick();
    if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
};

const handleIncomingMessage = (msg: ChatMessage) => {
    console.log('Admin received message:', msg);
    // If message is from/to the selected user, add to messages
    if (selectedConversation.value && (
        msg.sender_id === selectedConversation.value.id || 
        msg.receiver_id === selectedConversation.value.id
    )) {
        console.log('Message belongs to current view, adding to messages list');
        // Check for duplicates
        if (!messages.value.some(m => m.id === msg.id)) {
            messages.value.push(msg);
            scrollToBottom();
        }
    } else {
        console.log('Message is for another user or no user selected');
    }
    // Refresh conversation list to show latest message preview
    fetchConversations();
};

onMounted(() => {
    joinAdminRoom();
    fetchConversations();
    socketService.on('message:receive', handleIncomingMessage);
});

onUnmounted(() => {
    socketService.off('message:receive', handleIncomingMessage);
});

watch(messages, () => scrollToBottom(), { deep: true });
</script>

<template>
    <div class="flex h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
        <!-- Sidebar -->
        <div class="w-80 border-r border-green-100 flex flex-col bg-green-50/10">
            <div class="p-4 border-b border-green-100">
                <h2 class="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <MessageSquare class="w-5 h-5 text-green-600" />
                    Support Chat
                </h2>
                <div class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="Search customers..." 
                        class="w-full pl-10 pr-4 py-2 bg-white border border-green-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                    >
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-2 space-y-1">
                <button 
                    v-for="conv in filteredConversations" 
                    :key="conv.id"
                    @click="selectConversation(conv)"
                    class="w-full p-4 rounded-xl text-left transition-all flex items-start gap-3 group relative"
                    :class="selectedConversation?.id === conv.id ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'hover:bg-green-100/50'"
                >
                    <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold border border-white/30 shrink-0 capitalize">
                        {{ (conv.name || 'U').charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold truncate" :class="selectedConversation?.id === conv.id ? 'text-white' : 'text-gray-900'">
                            {{ conv.name }}
                        </div>
                        <div class="text-xs truncate" :class="selectedConversation?.id === conv.id ? 'text-white/80' : 'text-gray-500'">
                            {{ conv.last_message || 'No messages' }}
                        </div>
                    </div>
                </button>
                <div v-if="filteredConversations.length === 0" class="p-8 text-center text-gray-400">
                    <User class="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p class="text-xs">No active conversations</p>
                </div>
            </div>
        </div>

        <!-- Chat Area -->
        <div class="flex-1 flex flex-col bg-white">
            <template v-if="selectedConversation">
                <!-- Header -->
                <div class="p-4 border-b border-green-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 capitalize">
                            {{ (selectedConversation.name || 'U').charAt(0) }}
                        </div>
                        <div>
                            <div class="font-bold text-gray-900 text-sm">{{ selectedConversation.name }}</div>
                            <div class="text-[10px] text-green-600">{{ selectedConversation.email }}</div>
                        </div>
                    </div>
                    <button 
                        @click="openOrderModal"
                        class="flex items-center gap-2 px-4 py-2 bg-bakery-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md shadow-bakery-100 active:scale-95"
                    >
                        <PlusCircle class="w-4 h-4" />
                        Create Order
                    </button>
                </div>

                <!-- Messages -->
                <div ref="messageContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
                    <div 
                        v-for="msg in messages" 
                        :key="msg.id"
                        class="flex flex-col"
                        :class="msg.sender_id === user?.id ? 'items-end' : 'items-start'"
                    >
                        <div 
                            class="max-w-[70%] p-4 rounded-2xl text-sm shadow-sm relative group"
                            :class="msg.sender_id === user?.id 
                                ? 'bg-green-600 text-white rounded-tr-none' 
                                : isOrderRequest(msg.message)
                                    ? 'bg-amber-50 text-amber-900 rounded-tl-none border border-amber-200 ring-2 ring-amber-100'
                                    : 'bg-gray-50 text-gray-900 rounded-tl-none border border-gray-100'"
                        >
                            <div v-if="msg.sender_id !== user?.id && isOrderRequest(msg.message)" class="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                                <ShoppingBag class="w-3 h-3" />
                                Order Request
                            </div>
                            {{ msg.message }}
                            
                            <button 
                                v-if="msg.sender_id !== user?.id && isOrderRequest(msg.message)"
                                @click="openOrderModal"
                                class="mt-3 w-full py-2 bg-amber-600 text-white rounded-lg text-[10px] font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <PlusCircle class="w-3.5 h-3.5" />
                                Process Order Request
                            </button>
                        </div>
                        <div class="text-[10px] text-gray-400 mt-1 px-1 flex items-center gap-1">
                            <Clock class="w-3 h-3" />
                            {{ new Date(msg.created_at).toLocaleTimeString() }}
                        </div>
                    </div>
                </div>

                <!-- Input -->
                <div class="p-4 border-t border-green-100">
                    <form @submit.prevent="handleSend" class="flex gap-2">
                        <input 
                            v-model="newMessage"
                            type="text" 
                            placeholder="Type your message..." 
                            class="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                        >
                        <button 
                            type="submit"
                            :disabled="!newMessage.trim()"
                            class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            <Send class="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </template>
            <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare class="w-10 h-10 text-green-100 opacity-30" />
                </div>
                <h3 class="font-bold text-gray-600">Select a conversation</h3>
                <p class="text-sm">Pick a customer from the left to start chatting</p>
            </div>
        </div>

        <!-- Order Creation Modal -->
        <div v-if="isOrderModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-bakery-50">
                    <div>
                        <h2 class="text-xl font-bold text-bakery-900">Create Order for {{ selectedConversation?.name }}</h2>
                        <p class="text-xs text-bakery-400 mt-1">Select items to add to the customer's new order</p>
                    </div>
                    <button @click="isOrderModalOpen = false" class="text-gray-400 hover:text-gray-600 p-2"><X class="w-6 h-6" /></button>
                </div>

                <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
                    <!-- Product Selection -->
                    <div class="flex-1 overflow-y-auto p-6 space-y-4 border-r border-gray-100">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div 
                                v-for="product in products" 
                                :key="product.id"
                                class="p-3 border border-gray-100 rounded-2xl hover:border-bakery-900 transition-all cursor-pointer group flex gap-3"
                                @click="addToOrder(product)"
                            >
                                <img :src="product.image" class="w-16 h-16 rounded-xl object-cover" />
                                <div class="flex-1">
                                    <div class="font-bold text-sm text-bakery-900">{{ product.name }}</div>
                                    <div class="text-xs text-bakery-400">{{ formatPrice(product.price) }}</div>
                                    <button class="mt-2 text-[10px] font-bold text-bakery-900 bg-bakery-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        + Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="w-full md:w-80 bg-gray-50/50 p-6 flex flex-col">
                        <h3 class="text-sm font-black uppercase tracking-widest text-bakery-400 mb-4">Order Summary</h3>
                        <div class="flex-1 overflow-y-auto space-y-3">
                            <div v-if="orderItems.length === 0" class="h-full flex flex-col items-center justify-center text-center opacity-30">
                                <ShoppingBag class="w-8 h-8 mb-2" />
                                <p class="text-xs">No items added yet</p>
                            </div>
                            <div 
                                v-for="item in orderItems" 
                                :key="item.productId"
                                class="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                            >
                                <div class="min-w-0 flex-1 pr-2">
                                    <div class="text-xs font-bold truncate">{{ item.productName }}</div>
                                    <div class="text-[10px] text-gray-500">{{ item.quantity }} x {{ formatPrice(item.price) }}</div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button @click="removeFromOrder(item.productId)" class="text-red-400 hover:text-red-600">
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 pt-4 border-t border-gray-200">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-sm font-medium text-gray-500">Total</span>
                                <span class="text-xl font-black text-bakery-900">{{ formatPrice(orderTotal) }}</span>
                            </div>
                            <button 
                                @click="handleCreateOrder"
                                :disabled="orderItems.length === 0 || isSubmittingOrder"
                                class="w-full py-4 bg-bakery-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg shadow-bakery-100 disabled:opacity-30 flex items-center justify-center gap-2"
                            >
                                <span v-if="isSubmittingOrder" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {{ isSubmittingOrder ? 'Placing Order...' : 'Confirm Order' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
