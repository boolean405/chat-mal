import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function readChat(req, res, next) {
  try {
    const user = req.user;
    const chatId = req.body.chatId;

    const chat = await ChatDB.findById(chatId);
    if (!chat) throw resError(404, "Chat not found!");

    const isUserInChat = chat.users.some((u) => u.user.equals(user._id));
    if (!isUserInChat)
      throw resError(403, "You are not a member of this chat.");

    await ChatDB.updateOne(
      { _id: chatId },
      {
        $set: {
          "unreadCounts.$[elem].count": 0,
        },
      },
      {
        arrayFilters: [{ "elem.user": user._id }],
      }
    );

    return resJson(res, 200, "Chat marked as read.");
  } catch (error) {
    next(error);
  }
}
