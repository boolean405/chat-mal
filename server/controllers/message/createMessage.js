import ChatDB from "../../models/chat.js";
import UserDB from "../../models/user.js";
import MessageDB from "../../models/message.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function createMessage(req, res, next) {
  try {
    const userId = req.userId;
    const { chatId, content, type } = req.body;

    const [userExists, chat] = await Promise.all([
      UserDB.exists({ _id: userId }),
      ChatDB.findById(chatId).select("users unreadCounts"),
    ]);

    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!chat) throw resError(404, "Chat not found!");

    // 1. Create message
    const newMessage = await MessageDB.create({
      sender: userId,
      chat: chatId,
      type,
      content,
    });

    // 2. Update chat with new latestMessage
    await ChatDB.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id,
    });

    // 3. Increment unreadCounts (except sender)
    const bulkUpdates = chat.users
      .map(({ user }) => user.toString())
      .filter((id) => id !== userId)
      .map((otherUserId) => ({
        updateOne: {
          filter: {
            _id: chatId,
            "unreadCounts.user": otherUserId,
          },
          update: {
            $inc: {
              "unreadCounts.$.count": 1,
            },
          },
        },
      }));

    if (bulkUpdates.length > 0) {
      await ChatDB.bulkWrite(bulkUpdates);
    }

    // 4. Fully re-fetch the updated message (with populated fields)
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
            path: "unreadCounts.user",
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

    resJson(res, 201, "Success send message.", message);
  } catch (error) {
    next(error);
  }
}
