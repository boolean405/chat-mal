import { addUserOnline, getOnlineUsers } from "../utils/redisHelpers.js";
import onJoinChat from "./onJoinChat.js";
import onLeaveChat from "./onLeaveChat.js";
import onSendMessage from "./onSendMessage.js";
import onDisconnect from "./onDisconnect.js";
import onTyping from "./onTyping.js";
import fetchAll from "../fetchAll.js";

export default async function onConnection(socket, io) {
  const user = socket.user;
  console.log("✅ User connected:", user.name);

  await addUserOnline(user._id.toString(), socket.id);
  const onlineUserIds = await getOnlineUsers();
  io.emit("online-users", onlineUserIds);

  socket.on("join-chat", (chatId) => onJoinChat(socket, io, chatId));
  socket.on("leave-chat", (chatId) => onLeaveChat(socket, chatId));
  socket.on("send-message", (data) => onSendMessage(socket, io, data));
  socket.on("typing", (data) => onTyping(socket, io, data, true));
  socket.on("stop-typing", (data) => onTyping(socket, io, data, false));
  socket.on("fetch-all", () => fetchAll(io, socket));
  socket.on("disconnect", () => onDisconnect(socket, io));
}
