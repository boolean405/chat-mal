import ChatDB from "../models/chat.js";
import MessageDB from "../models/message.js";

export default async function fetchAll(socket) {
  try {
    const userId = socket.user._id;

    const chats = await ChatDB.find({ "users.user": userId });

    for (const chat of chats) {
      const unreadInfo = chat.unreadInfos?.find(
        (info) => info.user.toString() === userId.toString()
      );

      if (unreadInfo?.count > 0) {
        const deletedInfo = chat.deletedInfos?.find(
          (info) => info.user.toString() === userId.toString()
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
                path: "users.user groupAdmins.user initiator unreadInfos.user deletedInfos.user",
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
  } catch (err) {
    console.error("❌ Failed to resend messages:", err.message);
    socket.emit("error", { message: "Could not sync missed messages." });
  }
}
