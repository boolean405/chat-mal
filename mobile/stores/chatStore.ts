// stores/chatStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chat } from "@/types";

interface ChatStore {
  chats: Chat[];
  addChats: (newChats: Chat[]) => void;
  updateChat: (updatedChat: Chat) => void;
  deleteChat: (chatId: string) => void;
  leaveGroup: (groupId: string) => void; // Add this
  clearChats: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      chats: [],
      addChats: (newChats) =>
        set((state) => {
          const existingIds = new Set(state.chats.map((c) => c._id));
          const uniqueNewChats = newChats.filter(
            (chat) => !existingIds.has(chat._id)
          );

          // Combine and sort by createdAt (newest first)
          const allChats = [...uniqueNewChats, ...state.chats].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });

          return { chats: allChats };
        }),
      updateChat: (updatedChat) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat._id === updatedChat._id ? updatedChat : chat
          ),
        })),
      deleteChat: (chatId) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat._id !== chatId),
        })),
      leaveGroup: (groupId) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat._id !== groupId),
        })),
      clearChats: () => set({ chats: [] }),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Add migration in case stored data is corrupted
      migrate: (persistedState: any) => {
        if (!persistedState?.chats) {
          return { chats: [] };
        }
        return persistedState;
      },
    }
  )
);
