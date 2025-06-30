// hooks/useChatData.ts
import { useEffect, useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { getChat } from "@/api/chat";
import { Chat } from "@/types";

export function useChatData(chatId: string) {
  const storeChat = useChatStore((state) => state.getChat(chatId));
  const setChat = useChatStore((state) => state.setChat);

  const [chat, setChatState] = useState<Chat | null>(storeChat ?? null);
  const [isLoading, setIsLoading] = useState(!storeChat);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeChat) fetchChatData();
  }, [chatId]);

  const fetchChatData = async () => {
    setIsLoading(true);
    try {
      const data = await getChat(chatId);
      setChat(chatId, data.result); // update store
      setChatState(data.result); // update local state
    } catch (err: any) {
      setError(err.message || "Failed to load chat");
    } finally {
      setIsLoading(false);
    }
  };

  return { chat, isLoading, error, refetch: fetchChatData };
}
