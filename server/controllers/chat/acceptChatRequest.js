import ChatDB from "../../models/chat.js";
import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function acceptChatRequest(req, res, next) {
  try {
    const user = req.user;
    const chatId = req.body.chatId;

    const dbChat = await ChatDB.findById(chatId).populate("users.user");
    if (!dbChat) throw resError(404, "Chat not found!");

    if (!dbChat.isPending) throw resError(409, "Chat is already accepted.");

    if (
      !dbChat.users.some((u) => u.user._id.toString() === user._id.toString())
    )
      throw resError(403, "You are not a member of this chat!");

    if (dbChat.initiator.toString() === user._id.toString())
      throw resError(403, "You can't accept your own chat request!");

    // Accept chat request
    const updatedChat = await ChatDB.findByIdAndUpdate(
      chatId,
      {
        isPending: false,
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

    return resJson(res, 200, "Chat request accepted.", updatedChat);
  } catch (error) {
    next(error);
  }
}
