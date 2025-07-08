import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import UserPrivacyDB from "../../models/userPrivacy.js";

export default async function createOrOpen(req, res, next) {
  try {
    const userId = req.userId;
    const receiverId = req.body.receiverId;

    const [userExists, dbReceiver] = await Promise.all([
      UserDB.exists({ _id: userId }),
      UserDB.findById(receiverId),
    ]);

    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!dbReceiver) throw resError(404, "Receiver not found!");

    const isChat = await ChatDB.findOne({
      isGroupChat: false,
      users: {
        $all: [
          { $elemMatch: { user: userId } },
          { $elemMatch: { user: receiverId } },
        ],
      },
    })
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

    if (isChat) {
      return resJson(res, 200, "Success open PM chat.", isChat);
    } else {
      const receiverPrivacy = await UserPrivacyDB.findOne({ user: receiverId });

      let isPending = false;
      if (receiverPrivacy?.isRequestMessage) isPending = true;

      const newChat = {
        users: [{ user: userId }, { user: receiverId }],
        isPending,
        initiator: userId,
        unreadCounts: [
          { user: userId, count: 0 },
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
