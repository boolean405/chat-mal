import readChatService from "../../services/readChatService.js";
import { setUserActiveChat } from "../utils/redisHelpers.js";

export default async function onJoinChat(socket, io, chatId) {
  const user = socket.user;
  socket.join(chatId);
  socket.emit("joined-chat", chatId);

  await setUserActiveChat(user._id.toString(), chatId);

  try {
    await readChatService(user._id, chatId);
    socket.to(chatId).emit("chat-read", {
      chatId,
      userId: user._id,
    });
  } catch (err) {
    console.error("Error in readChatService:", err.message);
  }
}
