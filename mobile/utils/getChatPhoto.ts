import { Chat } from "@/types";

export function getChatPhoto(chat: Chat, userId: string): string | undefined {
  if (chat.isGroupChat) return chat.groupPhoto;

  const userObj = chat.users?.find(
    (u) => u?.user?._id && u.user._id !== userId
  );

  return userObj?.user?.profilePhoto;
}
