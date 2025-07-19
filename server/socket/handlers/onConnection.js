// /socket/handlers/onConnection.js
import { addUserOnline, getOnlineUsers } from "../utils/redisHelpers.js";

import onJoinChat from "./onJoinChat.js";
import onLeaveChat from "./onLeaveChat.js";
import onSendMessage from "./onSendMessage.js";
import onTyping from "./onTyping.js";
import onDisconnect from "./onDisconnect.js";
import syncUserChats from "./syncUserChats.js"; // ✅ import new file

export default async function onConnection(socket, io) {
  const user = socket.user;
  const userId = user._id.toString();

  await addUserOnline(userId, socket.id);
  const onlineUserIds = await getOnlineUsers();
  io.emit("online-users", onlineUserIds);

  // ✅ Sync chats/messages on connect
  await syncUserChats(socket, io);

  socket.on("join-chat", (chatId) => onJoinChat(socket, io, chatId));
  socket.on("leave-chat", (chatId) => onLeaveChat(socket, chatId));
  socket.on("send-message", (data) => onSendMessage(socket, io, data));
  socket.on("typing", (data) => onTyping(socket, io, data, true));
  socket.on("stop-typing", (data) => onTyping(socket, io, data, false));
  socket.on("disconnect", () => onDisconnect(socket, io));
}
