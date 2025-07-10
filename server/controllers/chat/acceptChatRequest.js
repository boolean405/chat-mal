import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function acceptChatRequest(req, res, next) {
  try {
    const userId = req.userId;
    const chatId = req.body.chatId;

    const [userExists, dbChat] = await Promise.all([
      UserDB.exists({ _id: userId }),
      ChatDB.findById(chatId),
    ]);

    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!dbChat) throw resError(404, "Chat not found!");

    if (!dbChat.isPending) throw resError(400, "Chat is already accepted.");
    if (!dbChat.users.some((u) => u.user.toString() === userId))
      throw resError(403, "Forbidden!");

    const updatedChat = await ChatDB.findByIdAndUpdate(
      chatId,
      {
        isPending: false,
      },
      { new: true }
    )
      .populate({
        path: "users.user initiator unreadCounts.user deletedInfos.user",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      });

    resJson(res, 200, "Chat request accepted.", updatedChat);
  } catch (error) {
    next(error);
  }
}
