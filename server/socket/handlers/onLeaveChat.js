// /socket/handlers/onLeaveChat.js
import {
  getUserActiveChat,
  clearUserActiveChat,
} from "../utils/redisHelpers.js";

export default async function onLeaveChat(socket, chatId) {
  const user = socket.user;

  socket.leave(chatId);

  const activeChatId = await getUserActiveChat(user._id.toString());
  if (activeChatId === chatId) {
    await clearUserActiveChat(user._id.toString());
  }
}
