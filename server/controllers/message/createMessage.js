import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import MessageDB from "../../models/message.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import uploadMessageMedia from "../../utils/uploadMessageMedia.js";

export default async function createMessage(req, res, next) {
  try {
    const user = req.user;
    const { chatId, content: origContent, type } = req.body;

    const chat = await ChatDB.findById(chatId).populate("users unreadInfos");

    if (!chat) throw resError(404, "Chat not found!");

    // 🔥 Auto-follow in private (non-group) chat
    if (!chat.isGroupChat && chat.users.length === 2) {
      const otherUserId =
        chat.users.find(
          (entry) =>
            (entry.user || entry)._id.toString() !== user._id.toString()
        )?.user?._id ||
        chat.users.find((entry) => entry._id.toString() !== user._id.toString())
          ?._id;

      if (otherUserId) {
        const [currentUser, otherUser] = await Promise.all([
          UserDB.findById(user._id).select("following"),
          UserDB.findById(otherUserId).select("followers"),
        ]);

        const isAlreadyFollowing = currentUser.following.includes(otherUserId);
        const isAlreadyFollower = otherUser.followers.includes(user._id);

        const updates = [];

        if (!isAlreadyFollowing) {
          updates.push(
            UserDB.updateOne(
              { _id: user._id },
              { $addToSet: { following: otherUserId } }
            )
          );
        }

        if (!isAlreadyFollower) {
          updates.push(
            UserDB.updateOne(
              { _id: otherUserId },
              { $addToSet: { followers: user._id } }
            )
          );
        }

        if (updates.length > 0) {
          await Promise.all(updates);
        }
      }
    }

    // Upload media if image or video to cloudinary
    let content = origContent;
    if (type === "image" || type === "video") {
      content = await uploadMessageMedia(
        user,
        type,
        origContent,
        `chat-mal/chats/${type}`
      );
    }

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

    // 🧹 Clear all archivedInfos when a message is sent
    await ChatDB.updateOne(
      { _id: chatId },
      {
        $set: {
          archivedInfos: [],
        },
      }
    );

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
            path: "users.user deletedInfos.user unreadInfos.user initiator",
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
