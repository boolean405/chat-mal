import ChatDB from "../../models/chat.js";

export async function getUserChats(userId) {
  return ChatDB.find({ "users.user": userId });
}

export function getUnreadInfo(chat, userId) {
  return chat.unreadInfos?.find((info) => info.user.toString() === userId);
}
