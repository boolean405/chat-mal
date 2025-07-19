// /socket/handlers/onDisconnect.js
import {
  removeUserOnline,
  clearUserActiveChat,
  getOnlineUsers,
} from "../utils/redisHelpers.js";
import UserDB from "../../models/user.js";

export default async function onDisconnect(socket, io) {
  const user = socket.user;
  const userId = user._id.toString();

  await removeUserOnline(userId);
  await clearUserActiveChat(userId);

  const lastOnlineAt = new Date();
  await UserDB.findByIdAndUpdate(userId, { lastOnlineAt });

  const onlineUserIds = await getOnlineUsers();
  io.emit("online-users", onlineUserIds);
  io.emit("user-went-offline", { userId, lastOnlineAt });
}
