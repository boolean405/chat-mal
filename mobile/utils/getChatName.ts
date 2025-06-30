import { Chat } from "@/types";

export function getChatName(chat: Chat, userId: string): string | undefined {
  if (chat.isGroupChat) return chat.name;

  const userObj = chat.users?.find(
    (u) => u?.user?._id && u.user._id !== userId
  );

  return userObj?.user?.name;
}
