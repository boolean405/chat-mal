// stores/chatStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chat, Message } from "@/types";
import { useAuthStore } from "./authStore";

interface ChatStore {
  chats: Chat[];
  onlineUserIds: string[];
  currentChat: Chat | null;
  totalUnreadCount: number;
  requestUnreadCount: number;
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
    (set, get) => {
      // Calculate unreads
      const calculateTotalUnreadCount = (chats: Chat[], userId: string) => {
        return chats.reduce((total, chat) => {
          const info = chat.unreadInfos?.find(
            (uc) =>
              (typeof uc.user === "string" ? uc.user : uc.user._id) === userId
          );
          return total + (info?.count ?? 0);
        }, 0);
      };

      // Only show home unreads chats
      const filterHomeChats = (chats: Chat[], userId: string): Chat[] => {
        return chats.filter((chat) => {
          const isPending = chat?.isPending ?? false;
          const initiatorId =
            typeof chat.initiator === "string"
              ? chat.initiator
              : chat.initiator?._id;

          if (isPending && initiatorId !== userId) return false;

          const deletedInfo = chat.deletedInfos?.find(
            (info) =>
              (typeof info.user === "string" ? info.user : info.user?._id) ===
              userId
          );

          if (!deletedInfo) return true;

          const deletedAt = new Date(deletedInfo.deletedAt);

          if (chat.latestMessage?.createdAt) {
            const latestMsgAt = new Date(chat.latestMessage.createdAt);
            return deletedAt < latestMsgAt;
          }

          if (chat.updatedAt) {
            const chatUpdatedAt = new Date(chat.updatedAt);
            return deletedAt < chatUpdatedAt;
          }

          return false;
        });
      };

      // Message request count
      const calculateRequestUnreadCount = (
        chats: Chat[],
        userId: string
      ): number => {
        return chats.reduce((total, chat) => {
          const initiatorId =
            typeof chat.initiator === "string"
              ? chat.initiator
              : chat.initiator?._id;

          const isRequest = chat.isPending && initiatorId !== userId;

          if (!isRequest) return total;

          const myUnread = chat.unreadInfos?.find((uc) => {
            const ucUserId =
              typeof uc.user === "object" ? uc.user._id : uc.user;
            return ucUserId === userId;
          });

          return total + (myUnread?.count ?? 0);
        }, 0);
      };

      return {
        chats: [],
        currentChat: null,
        onlineUserIds: [],
        totalUnreadCount: 0,
        requestUnreadCount: 0,

        setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),

        // Update user last online time
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
            const allChats = [...uniqueNewChats, ...state.chats].sort(
              (a, b) => {
                const dateA = new Date(
                  a.latestMessage?.createdAt || a.updatedAt || 0
                ).getTime();
                const dateB = new Date(
                  b.latestMessage?.createdAt || b.updatedAt || 0
                ).getTime();
                return dateB - dateA; // Newest first
              }
            );
            const userId = useAuthStore.getState().user?._id || "";
            const homeChats = filterHomeChats(allChats, userId);
            const totalUnreadCount = calculateTotalUnreadCount(
              homeChats,
              userId
            );
            const requestUnreadCount = calculateRequestUnreadCount(
              allChats,
              userId
            );

            return {
              chats: allChats,
              totalUnreadCount,
              requestUnreadCount,
            };
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

            const userId = useAuthStore.getState().user?._id || "";
            const homeChats = filterHomeChats(updatedChats, userId);

            const totalUnreadCount = calculateTotalUnreadCount(
              homeChats,
              userId
            );
            const requestUnreadCount = calculateRequestUnreadCount(
              updatedChats,
              userId
            );

            return {
              chats: updatedChats,
              totalUnreadCount,
              requestUnreadCount,
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
      };
    },
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
