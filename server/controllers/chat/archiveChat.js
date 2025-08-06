import resJson from "../../utils/resJson.js";
import ChatDB from "../../models/chat.js";

export default async function archiveChat(req, res, next) {
  try {
    const user = req.user;
    const chatId = req.body.chatId;

    // Check if chat exists and user is a member
    const updatedChat = await ChatDB.findByIdAndUpdate(
      chatId,
      {
        $addToSet: {
          archivedInfos: { user: user._id, archivedAt: new Date() },
        },
      },
      { new: true }
    )
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
      });

    return resJson(res, 200, "Chat archived.", updatedChat);
  } catch (error) {
    next(error);
  }
}
