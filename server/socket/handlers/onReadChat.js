import readChatService from "../../services/readChatService.js";
import { getSocketId, setUserActiveChat } from "../utils/redisHelpers.js";

export default async function onReadChat(socket, io, chatId) {
  const user = socket.user;
  try {
    await readChatService(user._id, chatId);

    const socketId = await getSocketId(user._id.toString());
    if (socketId) {
      io.emit("chat-read", {
        chatId,
        userId: user._id,
      });
      console.log("here", socketId, user.name);
    }
  } catch (err) {
    console.error("Error in readChatService:", err.message);
  }
}
