import ChatDB from "../../models/chat.js";

export async function getUserChats(userId) {
  return ChatDB.find({ "users.user": userId });
}

export function getUnreadInfo(chat, userId) {
  return chat.unreadInfos?.find((info) => info.user.toString() === userId);
}

export async function getChatUsers(chatId) {
  const chat = await ChatDB.findById(chatId).select("users.user").lean();
  if (!chat) {throw new Error("Chat not found");}

  return chat.users.map((u) => u.user.toString());
}
