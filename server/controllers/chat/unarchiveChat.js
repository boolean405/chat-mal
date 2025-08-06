import resJson from "../../utils/resJson.js";
import ChatDB from "../../models/chat.js";

export default async function unarchiveChat(req, res, next) {
  try {
    const user = req.user;
    const chatId = req.body.chatId;

    // Check if chat exists and user is a member
    const updatedChat = await ChatDB.findByIdAndUpdate(
      chatId,
      {
        $pull: {
          archivedInfos: { user: user._id },
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

    return resJson(res, 200, "Chat unarchived.", updatedChat);
  } catch (error) {
    next(error);
  }
}
