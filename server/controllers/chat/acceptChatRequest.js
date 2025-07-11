import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function acceptChatRequest(req, res, next) {
  try {
    const user = req.user;
    const chatId = req.body.chatId;

    const dbChat = await ChatDB.findById(chatId);

    if (!dbChat) throw resError(404, "Chat not found!");

    if (!dbChat.isPending) throw resError(400, "Chat is already accepted.");

    if (!dbChat.users.some((u) => u.user.toString() === user._id.toString()))
      throw resError(403, "You are not a user of this chat!");

    if (dbChat.initiator.toString() === user._id.toString())
      throw resError(403, "You can't accept of other user's request!");

    const chat = await ChatDB.findByIdAndUpdate(
      chatId,
      {
        isPending: false,
      },
      { new: true }
    )
      .populate({
        path: "users.user initiator unreadInfos.user deletedInfos.user",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      });

    resJson(res, 200, "Chat request accepted.", chat);
  } catch (error) {
    next(error);
  }
}
