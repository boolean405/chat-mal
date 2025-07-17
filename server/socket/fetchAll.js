import ChatDB from "../models/chat.js";
import MessageDB from "../models/message.js";
import { REDIS_ONLINE_USERS_KEY } from "../constants/index.js";

export default async function fetchAll(io, socket) {
  try {
    const userId = socket.user._id.toString();

    // Get all chats this user is part of
    const chats = await ChatDB.find({ "users.user": userId });

    for (const chat of chats) {
      const unreadInfo = chat.unreadInfos?.find(
        (info) => info.user.toString() === userId
      );

      if (unreadInfo?.count > 0) {
        const deletedInfo = chat.deletedInfos?.find(
          (info) => info.user.toString() === userId
        );
        const deletedAt = deletedInfo?.deletedAt || null;

        const messages = await MessageDB.find({
          chat: chat._id,
          ...(deletedAt && { createdAt: { $gt: deletedAt } }),
        })
          .sort({ createdAt: -1 })
          .limit(unreadInfo.count)
          .populate("sender", "-password")
          .populate({
            path: "chat",
            populate: [
              {
                path: "users.user unreadInfos.user deletedInfos.user initiator",
                select: "-password",
              },
              { path: "latestMessage" },
            ],
          });

        messages.reverse().forEach((message) => {
          socket.emit("new-message", { message });
        });
      }
      // Emit the chat (even if no unread messages)
      socket.emit("new-chat", { chat });
    }

    // Mark as delivered when online
    // for (const chat of chats) {
    //   const messages = await MessageDB.find({
    //     chat: chat._id,
    //     sender: { $ne: userId }, // messages not sent by this user
    //     createdAt: { $gt: socket.user.lastOnlineAt || new Date(0) }, // new messages
    //   });

    //   for (const message of messages) {
    //     // Notify the sender if online
    //     const senderSocketId = await Redis.hGet(
    //       REDIS_ONLINE_USERS_KEY,
    //       message.sender.toString()
    //     );
    //     if (senderSocketId) {
    //       io.to(senderSocketId).emit("message-delivered", {
    //         messageId: message._id,
    //         // deliveredTo: userId,
    //       });
    //     }
    //   }
    // }
  } catch (err) {
    console.error("❌ Failed to resend messages:", err.message);
    socket.emit("error", { message: "Could not sync missed messages." });
  }
}
