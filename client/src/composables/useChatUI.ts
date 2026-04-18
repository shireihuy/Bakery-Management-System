import { ref } from 'vue';

const activeChat = ref<'SUPPORT' | 'AI' | null>(null);

export function useChatUI() {
    const openSupportChat = () => {
        activeChat.value = 'SUPPORT';
    };

    const openAIChat = () => {
        activeChat.value = 'AI';
    };

    const closeAll = () => {
        activeChat.value = null;
    };

    const toggleSupportChat = () => {
        activeChat.value = activeChat.value === 'SUPPORT' ? null : 'SUPPORT';
    };

    const toggleAIChat = () => {
        activeChat.value = activeChat.value === 'AI' ? null : 'AI';
    };

    return {
        activeChat,
        openSupportChat,
        openAIChat,
        closeAll,
        toggleSupportChat,
        toggleAIChat
    };
}
