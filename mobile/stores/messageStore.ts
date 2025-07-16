// store/messageStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Message } from "@/types";

interface MessageState {
  messages: Record<string, Message[]>;
  markMessagesAsSeen: (chatId: string, seenByUserId: string) => void;
  setMessages: (chatId: string, msgs: Message[]) => void;
  addMessage: (chatId: string, msg: Message) => void;
  prependMessages: (chatId: string, msgs: Message[]) => void;
  clearMessages: (chatId: string) => void;
  clearAllMessages: () => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      messages: {},

      markMessagesAsSeen: (chatId: string, seenByUserId: string) =>
        set((state) => {
          const chatMessages = state.messages[chatId] || [];

          const updatedMessages = chatMessages.map((msg) =>
            (msg.sender._id || msg.sender) !== seenByUserId &&
            msg.status !== "seen"
              ? { ...msg, status: "seen" }
              : msg
          );

          return {
            messages: {
              ...state.messages,
              [chatId]: updatedMessages,
            },
          };
        }),

      setMessages: (chatId, msgs) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: msgs,
          },
        })),
      // Add new message to the start of the array for this chat
      addMessage: (chatId, newMsg) =>
        set((state) => {
          const prev = state.messages[chatId] || [];
          // Avoid duplicates
          const filtered = prev.filter((msg) => msg._id !== newMsg._id);
          return {
            messages: {
              ...state.messages,
              [chatId]: [newMsg, ...filtered], // Add to start
            },
          };
        }),
      prependMessages: (chatId, newMessages) =>
        set((state) => {
          const prev = state.messages[chatId] || [];
          // Append older messages to the end
          const combined = [...prev, ...newMessages];
          // Remove duplicates by _id
          const unique = Array.from(
            new Map(combined.map((msg) => [msg._id, msg])).values()
          );
          return {
            messages: {
              ...state.messages,
              [chatId]: unique,
            },
          };
        }),
      clearMessages: (chatId) =>
        set((state) => {
          const newMessages = { ...state.messages };
          delete newMessages[chatId];
          return { messages: newMessages };
        }),
      // Clear all messages
      clearAllMessages: () => set({ messages: {} }),
    }),
    {
      name: "messages-storage",
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: any) => {
        // Migration from old array format to new chat-specific format
        if (Array.isArray(persistedState?.messages)) {
          return { messages: {} };
        }
        return persistedState || { messages: {} };
      },
    }
  )
);
