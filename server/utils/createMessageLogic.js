// logic/createMessageLogic.js
import ChatDB from "../models/chat.js";
import UserDB from "../models/user.js";
import MessageDB from "../models/message.js";

export default async function createMessageLogic({
  userId,
  chatId,
  content,
  type,
}) {
  const [userExists, chat] = await Promise.all([
    UserDB.exists({ _id: userId }),
    ChatDB.findById(chatId).select("users unreadInfos"),
  ]);

  if (!userExists) throw new Error("Authenticated user not found!");
  if (!chat) throw new Error("Chat not found!");

  const newMessage = await MessageDB.create({
    sender: userId,
    chat: chatId,
    type,
    content,
  });

  await ChatDB.findByIdAndUpdate(chatId, {
    latestMessage: newMessage._id,
  });

  const bulkUpdates = chat.users
    .map(({ user }) => user.toString())
    .filter((id) => id !== userId)
    .map((otherUserId) => ({
      updateOne: {
        filter: {
          _id: chatId,
          "unreadInfos.user": otherUserId,
        },
        update: {
          $inc: {
            "unreadInfos.$.count": 1,
          },
        },
      },
    }));

  if (bulkUpdates.length > 0) {
    await ChatDB.bulkWrite(bulkUpdates);
  }

  const message = await MessageDB.findById(newMessage._id)
    .populate({
      path: "sender",
      select: "-password",
    })
    .populate({
      path: "chat",
      populate: [
        {
          path: "users.user",
          select: "-password",
        },
        {
          path: "unreadInfos.user",
          select: "-password",
        },
        {
          path: "latestMessage",
          populate: {
            path: "sender",
            select: "-password",
          },
        },
      ],
    })
    .lean();

  return message; // contains full chat and message
}
