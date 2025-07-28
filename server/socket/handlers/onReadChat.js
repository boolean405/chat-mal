import readChatService from "../../services/readChatService.js";
import { setUserActiveChat } from "../utils/redisHelpers.js";

export default async function onReadChat(socket, io, chatId) {
  const user = socket.user;
  try {
    await readChatService(user._id, chatId);
    console.log("here");

    socket.to(chatId).emit("chat-read", {
      chatId,
      userId: user._id,
    });
  } catch (err) {
    console.error("Error in readChatService:", err.message);
  }
}
