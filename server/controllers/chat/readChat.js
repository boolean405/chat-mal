import resJson from "../../utils/resJson.js";
import readChatService from "../../services/readChatService.js";

export default async function readChat(req, res, next) {
  try {
    const user = req.user;
    const chatId = req.body.chatId;

    // Check if chat exists and user is a member
    const updatedChat = await readChatService(user._id, chatId);

    return resJson(res, 200, "Chat marked as read.", updatedChat);
  } catch (error) {
    next(error);
  }
}
