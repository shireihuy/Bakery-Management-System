import { ref } from "vue";
import { socketService } from "../services/socket";
import { useAuth } from "./useAuth";

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  province_id?: number;
  district_id?: number;
  ward_code?: string;
  last_message: string;
  last_message_time: string;
}

// Singleton state to share across components
const messages = ref<ChatMessage[]>([]);
const conversations = ref<Conversation[]>([]);
const loading = ref(false);

import { API_URL } from "../config/api";

export function useChat() {
  const { user } = useAuth();

  const fetchHistory = async (otherUserId: string) => {
    if (!otherUserId) return;
    loading.value = true;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/chat/history/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        messages.value = await response.json();
      }
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchConversations = async () => {
    loading.value = true;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        conversations.value = await response.json();
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      loading.value = false;
    }
  };

  const sendMessage = (receiverId: string | null, text: string) => {
    if (!user.value || !text.trim()) return;

    socketService.emit("message:send", {
      sender_id: user.value.id,
      receiver_id: receiverId,
      message: text
    });
  };

  const joinAdminRoom = () => {
    socketService.emit("join:admin", {});
  };

  return {
    messages,
    conversations,
    loading,
    fetchHistory,
    fetchConversations,
    sendMessage,
    joinAdminRoom
  };
}
