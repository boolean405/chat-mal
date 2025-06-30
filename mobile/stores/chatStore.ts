import { create } from "zustand";
import { Chat } from "@/types"; // adjust path if needed

type ChatStore = {
  chats: Record<string, Chat>;
  setChat: (chatId: string, chatData: Chat) => void;
  getChat: (chatId: string) => Chat | undefined;
  clearChats: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: {},
  setChat: (chatId, chatData) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: chatData,
      },
    })),
  getChat: (chatId) => get().chats[chatId],
  clearChats: () => set({ chats: {} }),
}));
