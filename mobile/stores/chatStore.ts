// stores/chatStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chat } from "@/types";

interface ChatStore {
  chats: Chat[];
  onlineUserIds: string[];
  currentChat: Chat | null;
  setOnlineUserIds: (ids: string[]) => void;
  updateUserLastOnlineAt: (userId: string, lastOnlineAt: Date) => void;
  setChats: (newChats: Chat[]) => void;
  updateChat: (updatedChat: Chat) => void;
  clearChat: (chatId: string) => void;
  clearGroup: (groupId: string) => void;
  clearChats: () => void;
  // New methods
  getChatById: (chatId: string) => Chat | undefined;
  setCurrentChat: (chat: Chat | null) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChat: null,
      onlineUserIds: [],

      setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),

      updateUserLastOnlineAt: (userId, lastOnlineAt) =>
        set((state) => {
          const updatedChats = state.chats.map((chat) => {
            const updatedUsers = chat.users.map((u) => {
              if (u.user._id === userId) {
                return {
                  ...u,
                  user: {
                    ...u.user,
                    lastOnlineAt,
                  },
                };
              }
              return u;
            });

            return {
              ...chat,
              users: updatedUsers,
            };
          });

          return { chats: updatedChats };
        }),

      setChats: (newChats) =>
        set((state) => {
          const existingIds = new Set(state.chats.map((c) => c._id));
          const uniqueNewChats = newChats.filter(
            (chat) => !existingIds.has(chat._id)
          );

          // Combine and sort by lastMessage createdAt or chat createdAt
          const allChats = [...uniqueNewChats, ...state.chats].sort((a, b) => {
            const dateA = new Date(
              a.latestMessage?.createdAt || a.updatedAt || 0
            ).getTime();
            const dateB = new Date(
              b.latestMessage?.createdAt || b.updatedAt || 0
            ).getTime();
            return dateB - dateA; // Newest first
          });

          return { chats: allChats };
        }),

      updateChat: (updatedChat) =>
        set((state) => {
          // Replace the chat
          const updatedChats = state.chats.map((chat) =>
            chat._id === updatedChat._id ? updatedChat : chat
          );
          // Resort by latestMessage.createdAt or updatedAt
          updatedChats.sort((a, b) => {
            const dateA = new Date(
              a.latestMessage?.createdAt || a.updatedAt || 0
            ).getTime();
            const dateB = new Date(
              b.latestMessage?.createdAt || b.updatedAt || 0
            ).getTime();
            return dateB - dateA;
          });
          return {
            chats: updatedChats,
            currentChat:
              state.currentChat?._id === updatedChat._id
                ? updatedChat
                : state.currentChat,
          };
        }),

      clearChat: (chatId) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat._id !== chatId),
          currentChat:
            state.currentChat?._id === chatId ? null : state.currentChat,
        })),

      clearGroup: (groupId) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat._id !== groupId),
          currentChat:
            state.currentChat?._id === groupId ? null : state.currentChat,
        })),

      clearChats: () => set({ chats: [], currentChat: null }),

      getChatById: (chatId) => {
        return get().chats.find((chat) => chat._id === chatId);
      },

      setCurrentChat: (chat) => set({ currentChat: chat }),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: any) => {
        if (!persistedState?.chats) {
          return { chats: [], currentChat: null };
        }
        return {
          ...persistedState,
          currentChat: persistedState.currentChat || null, // Ensure currentChat exists
        };
      },
    }
  )
);
