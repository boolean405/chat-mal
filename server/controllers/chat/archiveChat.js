import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function archiveChat(req, res, next) {
  try {
    const user = req.user;
    const chatId = req.body.chatId;

    const chat = await ChatDB.findById(chatId);

    if (!chat) {throw resError(404, "Chat not found!");}

    const isArchived = chat.archivedInfos.some(
      (info) => info.user.toString() === user._id.toString()
    );

    // Perform update
    if (isArchived) {
      await ChatDB.findByIdAndUpdate(chatId, {
        $pull: {
          archivedInfos: { user: user._id },
        },
      });
    } else {
      await ChatDB.findByIdAndUpdate(chatId, {
        $addToSet: {
          archivedInfos: { user: user._id, archivedAt: new Date() },
        },
      });
    }

    // Populate after update
    const updatedChat = await ChatDB.findById(chatId)
      .populate({
        path: "users.user initiator unreadInfos.user deletedInfos.user archivedInfos.user",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      })
      .lean();

    return resJson(
      res,
      200,
      isArchived ? "Chat unarchived." : "Chat archived.",
      updatedChat
    );
  } catch (error) {
    next(error);
  }
}
