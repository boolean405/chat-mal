import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chat } from "@/types";

interface ChatState {
  chats: Record<string, Chat>;
  currentChatId: string | null;
  setChat: (chat: Chat) => void;
  getChat: (chatId: string) => Chat | null;
  addOrUpdateChats: (chats: Chat[]) => void;
  removeChat: (chatId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {},
      currentChatId: null,

      setChat: (chat) => {
        set({
          chats: { ...get().chats, [chat._id]: chat },
          currentChatId: chat._id,
        });
      },

      getChat: (chatId) => get().chats[chatId] || null,

      addOrUpdateChats: (chats) => {
        const updatedChats = { ...get().chats };
        chats.forEach((chat) => {
          updatedChats[chat._id] = chat;
        });
        set({ chats: updatedChats });
      },

      removeChat: (chatId) => {
        const { [chatId]: _, ...remaining } = get().chats;
        set({ chats: remaining });
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
