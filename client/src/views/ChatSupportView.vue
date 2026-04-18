<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { 
    Search, 
    Send,
    User,
    MessageSquare,
    Clock
} from 'lucide-vue-next';
import { useChat, type Conversation, type ChatMessage } from '../composables/useChat';
import { useAuth } from '../composables/useAuth';
import { socketService } from '../services/socket';

const { conversations, messages, fetchConversations, fetchHistory, sendMessage, joinAdminRoom } = useChat();
const { user } = useAuth();

const selectedConversation = ref<Conversation | null>(null);
const searchQuery = ref('');
const newMessage = ref('');
const messageContainer = ref<HTMLElement | null>(null);

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
                <div class="p-4 border-b border-green-100 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 capitalize">
                            {{ (selectedConversation.name || 'U').charAt(0) }}
                        </div>
                        <div>
                            <div class="font-bold text-gray-900 text-sm">{{ selectedConversation.name }}</div>
                            <div class="text-[10px] text-green-600">{{ selectedConversation.email }}</div>
                        </div>
                    </div>
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
                            class="max-w-[70%] p-4 rounded-2xl text-sm shadow-sm"
                            :class="msg.sender_id === user?.id 
                                ? 'bg-green-600 text-white rounded-tr-none' 
                                : 'bg-gray-50 text-gray-900 rounded-tl-none border border-gray-100'"
                        >
                            {{ msg.message }}
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
    </div>
</template>
