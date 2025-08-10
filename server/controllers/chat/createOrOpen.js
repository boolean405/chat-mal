import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import UserPrivacyDB from "../../models/userPrivacy.js";

export default async function createOrOpen(req, res, next) {
  try {
    const user = req.user;
    const receiverId = req.body.userId;
    const chatId = req.body.chatId;

    let chat;

    if (chatId) {
      // Find chat by chatId directly
      chat = await ChatDB.findById(chatId)
        .populate({
          path: "users.user",
          select: "-password",
        })
        .populate({
          path: "deletedInfos.user",
          select: "-password",
        })
        .populate({
          path: "initiator",
          select: "-password",
        })
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender",
            select: "-password",
          },
        })
        .populate({
          path: "unreadInfos.user",
          select: "-password",
        })
        .populate({
          path: "archivedInfos.user",
          select: "-password",
        })
        .lean();

      if (!chat) throw resError(404, "Chat not found.");

      // Optionally, reset unread count for current user if needed (like your current logic)
      const myUnread = chat.unreadInfos?.find(
        (uc) => uc.user.toString() === user._id.toString() && uc.count > 0
      );
      if (myUnread) {
        await ChatDB.findByIdAndUpdate(
          chat._id,
          {
            $set: {
              "unreadInfos.$[elem].count": 0,
            },
          },
          {
            arrayFilters: [{ "elem.user": user._id }],
          }
        );
      }

      return resJson(res, 200, "Success open chat by chatId.", chat);
    }

    // else, handle receiverId logic (your existing code)

    if (!(await UserDB.exists({ _id: receiverId })))
      throw resError(404, "Receiver not found!");

    const isChat = await ChatDB.findOne({
      isGroupChat: false,
      users: {
        $all: [
          { $elemMatch: { user: user._id } },
          { $elemMatch: { user: receiverId } },
        ],
      },
    });

    if (isChat) {
      const myUnread = isChat?.unreadInfos?.find(
        (uc) => uc.user.toString() === user._id.toString() && uc.count > 0
      );

      if (myUnread) {
        await ChatDB.findByIdAndUpdate(
          isChat._id,
          {
            $set: {
              "unreadInfos.$[elem].count": 0,
            },
          },
          {
            arrayFilters: [{ "elem.user": user._id }],
          }
        );
      }

      const chat = await ChatDB.findById(isChat._id)
        .populate({
          path: "users.user",
          select: "-password",
        })
        .populate({
          path: "deletedInfos.user",
          select: "-password",
        })
        .populate({
          path: "initiator",
          select: "-password",
        })
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender",
            select: "-password",
          },
        })
        .populate({
          path: "unreadInfos.user",
          select: "-password",
        })
        .populate({
          path: "archivedInfos.user",
          select: "-password",
        })
        .lean();

      return resJson(res, 200, "Success open PM chat.", chat);
    } else {
      const receiverPrivacy = await UserPrivacyDB.findOne({ user: receiverId });

      const isPending =
        receiverPrivacy?.isRequestMessage === true ? true : false;

      const newChat = {
        users: [{ user: user._id }, { user: receiverId }],
        isPending,
        initiator: user._id,
        unreadInfos: [
          { user: user._id, count: 0 },
          { user: receiverId, count: 0 },
        ],
      };

      const dbChat = await ChatDB.create(newChat);
      const chat = await ChatDB.findById(dbChat._id)
        .populate({
          path: "users.user",
          select: "-password",
        })
        .populate({
          path: "deletedInfos.user",
          select: "-password",
        })
        .populate({
          path: "initiator",
          select: "-password",
        })
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender",
            select: "-password",
          },
        })
        .populate({
          path: "unreadInfos.user",
          select: "-password",
        })
        .lean();

      return resJson(
        res,
        201,
        isPending
          ? "Chat request sent, waiting for approval."
          : "Created PM chat.",
        chat
      );
    }
  } catch (error) {
    next(error);
  }
}
