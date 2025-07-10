import ChatDB from "../../models/chat.js";
import UserDB from "../../models/user.js";
import MessageDB from "../../models/message.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function createMessage(req, res, next) {
  try {
    const user = req.user;
    const { chatId, content, type } = req.body;

    const [userExists, chat] = await Promise.all([
      UserDB.exists({ _id: user._id }),
      ChatDB.findById(chatId).select("users unreadInfos"),
    ]);

    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!chat) throw resError(404, "Chat not found!");

    // Create message
    const newMessage = await MessageDB.create({
      sender: user._id,
      chat: chatId,
      type,
      content,
    });

    // Update chat with new latestMessage
    await ChatDB.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id,
    });

    // Filter and add users to unreadcount for only group chat
    const unreadUserIds = chat.unreadInfos.map((entry) =>
      entry.user.toString()
    );
    const usersToAddUnread = chat.users
      .map((entry) => entry.user || entry) // normalize user
      .map((id) => id.toString())
      .filter(
        (id) => id !== user._id.toString() && !unreadUserIds.includes(id)
      );

    // Add missing unreadCount entries for those users
    if (usersToAddUnread.length > 0) {
      await ChatDB.updateOne(
        { _id: chatId },
        {
          $push: {
            unreadInfos: {
              $each: usersToAddUnread.map((id) => ({ user: id, count: 0 })),
            },
          },
        }
      );
    }

    // Increment unreadInfos (except sender)
    const bulkUpdates = chat.users
      .map((entry) => (entry.user || entry).toString())
      .filter((id) => id !== user._id.toString())
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

    // Fully re-fetch the updated message (with populated fields)
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

    resJson(res, 201, "Success send message.", message);
  } catch (error) {
    next(error);
  }
}
