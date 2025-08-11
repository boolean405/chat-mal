// /socket/handlers/onSendMessage.js
import ChatDB from "../../models/chat.js";
import MessageDB from "../../models/message.js";
import { getSocketId, getUserActiveChat } from "../utils/redisHelpers.js";
import { sendPushNotifications } from "../../utils/sendPushNotifications.js";

export default async function onSendMessage(socket, io, { chatId, message }) {
  const sender = socket.user;
  const chat = await ChatDB.findById(chatId);
  if (!chat) {
    return;
  }

  const otherUsers = chat.users
    .filter((u) => !u.user.equals(sender._id))
    .map((u) => u.user.toString());

  let updatedStatus = "sent";

  for (const otherUserId of otherUsers) {
    const socketId = await getSocketId(otherUserId);
    const isOnline = !!socketId;
    const activeChatId = await getUserActiveChat(otherUserId);
    const isInChat = activeChatId === chatId;

    if (isInChat) {
      await MessageDB.updateMany(
        {
          chat: chatId,
          sender: sender._id,
          status: { $ne: "seen" },
        },
        { $set: { status: "seen" } }
      );

      await ChatDB.updateOne(
        { _id: chatId, "unreadInfos.user": otherUserId },
        { $set: { "unreadInfos.$.count": 0 } }
      );

      io.to(chatId).emit("chat-read", {
        chatId,
        userId: otherUserId,
      });

      updatedStatus = "seen";
    } else if (isOnline) {
      await MessageDB.updateOne(
        { _id: message._id },
        { $set: { status: "delivered" } }
      );
      updatedStatus = "delivered";
    } else {
      const content =
        message.type === "text"
          ? message.content
          : message.type === "image"
          ? "Recieved an new photo"
          : message.type === "video"
          ? "Recieved a new video"
          : message.type === "audio"
          ? "Recieved a new voice message"
          : message.type === "file"
          ? "Recieved a new file"
          : "Recieved a new message";

      await sendPushNotifications(
        message.chat.users,
        sender._id,
        message.chat.name || message.sender.name,
        content,
        { chatId, messageId: message._id }
      );

      await MessageDB.updateOne(
        { _id: message._id },
        { $set: { isNotify: true } }
      );
    }
  }

  const updatedMessage = {
    ...message,
    status: updatedStatus,
  };

  io.to(chatId).emit("received-message", {
    message: updatedMessage,
  });

  for (const otherUserId of otherUsers) {
    const socketId = await getSocketId(otherUserId);
    if (socketId) {
      io.to(socketId).emit("new-message", {
        chatId,
        message: updatedMessage,
      });
    }
  }
}
