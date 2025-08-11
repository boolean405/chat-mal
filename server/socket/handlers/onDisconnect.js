import {
  removeUserOnline,
  clearUserActiveChat,
  getOnlineUsers,
} from "../utils/redisHelpers.js";
import { markUserOffline } from "../utils/userOnlineStatus.js";

export default async function onDisconnect(socket, io) {
  const user = socket.user;
  const userId = user._id.toString();
  const lastOnlineAt = new Date();

  await removeUserOnline(userId);
  await clearUserActiveChat(userId);
  await markUserOffline(userId);

  const onlineUserIds = await getOnlineUsers();
  io.emit("online-users", onlineUserIds);
  io.emit("user-went-offline", { userId, lastOnlineAt });
}
