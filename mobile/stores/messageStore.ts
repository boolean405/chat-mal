// stores/messageStore.ts
import { create } from "zustand";
import { Message } from "@/types";

interface MessageStore {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessageStatus: (
    id: string,
    status: "sent" | "delivered" | "seen"
  ) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessageStatus: (id, status) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === id ? { ...msg, status } : msg
      ),
    })),
  clearMessages: () => set({ messages: [] }),
}));
