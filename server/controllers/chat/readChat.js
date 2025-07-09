import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function readChat(req, res, next) {
  try {
    const user = req.user;
    const chatId = req.body.chatId;

    // Check if chat exists and user is a member
    const chat = await ChatDB.findById(chatId);
    if (!chat) throw resError(404, "Chat not found!");

    const isUserInChat = chat.users.some((u) => u.user.equals(user._id));
    if (!isUserInChat)
      throw resError(403, "You are not a member of this chat!");

    // Mark chat as read and return updated document
    const updatedChat = await ChatDB.findByIdAndUpdate(
      chatId,
      {
        $set: {
          "unreadCounts.$[elem].count": 0,
        },
      },
      {
        arrayFilters: [{ "elem.user": user._id }],
        new: true,
      }
    )
      .populate("latestMessage")
      .populate("users.user", "-password")
      .populate("groupAdmins.user", "-password");

    return resJson(res, 200, "Chat marked as read.", updatedChat);
  } catch (error) {
    next(error);
  }
}
