// store/messageStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Message } from "@/types";

interface MessageState {
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      messages: [],
      setMessages: (msgs) => set({ messages: msgs }),
      addMessage: (msg) =>
        set((state) => ({ messages: [msg, ...state.messages] })),
    }),
    {
      name: "messages-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
