import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function getChat(req, res, next) {
  try {
    const userId = req.userId;
    const chatId = req.params.chatId;

    const userExists = await UserDB.exists({ _id: userId });
    if (!userExists) throw resError(401, "Authenticated user not found!");

    const dbChat = await ChatDB.findById(chatId)
      .populate({
        path: "users.user deletedInfos.user initiator unreadInfos.user archivedInfos.user",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      });

    if (!dbChat) throw resError(404, "Chat not found!");

    // Ensure user is part of chat users
    const isMember = dbChat.users.some(
      (u) => u.user._id.toString() === userId.toString()
    );
    if (!isMember) throw resError(403, "You are not a member of this chat!");

    resJson(res, 200, "Success get chat details.", dbChat);
  } catch (error) {
    next(error);
  }
}
