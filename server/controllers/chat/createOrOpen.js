import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import UserPrivacyDB from "../../models/userPrivacy.js";

export default async function createOrOpen(req, res, next) {
  try {
    const user = req.user;
    const receiverId = req.body.receiverId;

    const dbReceiver = await UserDB.findById(receiverId);

    if (!dbReceiver) throw resError(404, "Receiver not found!");

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
      await ChatDB.updateOne(
        { _id: isChat._id },
        {
          $set: {
            "unreadCounts.$[elem].count": 0,
          },
        },
        {
          arrayFilters: [{ "elem.user": user._id }],
        }
      );

      // 🧠 Re-fetch with updated unreadCounts
      const updatedChat = await ChatDB.findById(isChat._id)
        .populate({
          path: "users.user",
          select: "-password",
        })
        .populate({
          path: "groupAdmins.user",
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
          path: "unreadCounts.user",
          select: "-password",
        })
        .lean();

      return resJson(res, 200, "Success open PM chat.", updatedChat);
    } else {
      const receiverPrivacy = await UserPrivacyDB.findOne({ user: receiverId });

      let isPending = false;
      if (receiverPrivacy?.isRequestMessage) isPending = true;

      const newChat = {
        users: [{ user: user._id }, { user: receiverId }],
        isPending,
        initiator: user._id,
        unreadCounts: [
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
          path: "groupAdmins.user",
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
          path: "unreadCounts.user",
          select: "-password",
        })
        .lean();

      resJson(
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
