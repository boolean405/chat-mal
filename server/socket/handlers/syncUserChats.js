// /socket/handlers/syncUserChats.js
import MessageDB from "../../models/message.js";
import { getUnreadInfo, getUserChats } from "../utils/chatHelper.js";
import { updateAndEmitMessages } from "../utils/messageStatusService.js";
import { getSocketId, getUserActiveChat } from "../utils/redisHelpers.js";

export default async function syncUserChats(socket, io) {
  const user = socket.user;
  const userId = user._id.toString();

  const chats = await getUserChats(userId);

  for (const chat of chats) {
    const chatId = chat._id.toString();
    const currentChatId = await getUserActiveChat(userId);
    const isInChatScreen = currentChatId === chatId;
    const newStatus = isInChatScreen ? "seen" : "delivered";

    const unreadInfo = getUnreadInfo(chat, userId);
    const messages = await updateAndEmitMessages({
      chat,
      userId,
      unreadInfo,
      socket,
      io,
    });

    if (messages?.length) {
      for (const msg of messages) {
        await MessageDB.updateOne(
          { _id: msg._id },
          { $set: { status: newStatus } }
        );

        const updatedMessage = { ...msg.toObject(), status: newStatus };

        socket.emit("received-message", { message: updatedMessage });
        socket.emit("new-message", { chatId, message: updatedMessage });

        const senderId = msg.sender._id.toString();
        const senderSocketId = await getSocketId(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("new-message", {
            chatId,
            message: updatedMessage,
          });
        }
      }
    }

    // Emit chat metadata
    socket.emit("new-chat", { chat });
  }
}
