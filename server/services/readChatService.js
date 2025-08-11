import ChatDB from "../models/chat.js";
import MessageDB from "../models/message.js";
import resError from "../utils/resError.js";

export default async function readChatService(userId, chatId) {
  // Check if chat exists
  const chat = await ChatDB.findById(chatId);
  if (!chat) {throw resError(404, "Chat not found!");}

  // Check user membership
  const isUserInChat = chat.users.some((u) => u.user.equals(userId));
  if (!isUserInChat) {throw resError(403, "You are not a member of this chat!");}

  // Mark chat as read
  const updatedChat = await ChatDB.findOneAndUpdate(
    {
      _id: chatId,
      "unreadInfos.user": userId,
    },
    {
      $set: {
        "unreadInfos.$.count": 0,
      },
    },
    {
      new: true,
    }
  )
    .populate("latestMessage")
    .populate({
      path: "users.user",
      select: "-password",
    });

  // Update messages sent by others to status: "seen"
  await MessageDB.updateMany(
    {
      chat: chatId,
      sender: { $ne: userId },
      status: { $ne: "seen" },
    },
    {
      $set: { status: "seen" },
    }
  );

  return updatedChat;
}
