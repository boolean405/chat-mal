import ChatDB from "../../models/chat.js";
import UserDB from "../../models/user.js";
import MessageDB from "../../models/message.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function createMessage(req, res, next) {
  try {
    const userId = req.userId;
    const { chatId, content, type } = req.body;

    const [userExists, chatExists] = await Promise.all([
      UserDB.exists({ _id: userId }),
      ChatDB.exists({ _id: chatId }),
    ]);

    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!chatExists) throw resError(404, "Chat not found!");

    const newMessage = await MessageDB.create({
      sender: userId,
      chat: chatId,
      type,
      content,
    });

    const message = await MessageDB.findById(newMessage._id)
      .populate({
        path: "sender",
        select: "-password",
      })
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "-password",
        },
      });

    if (message)
      await ChatDB.findByIdAndUpdate(chatId, { latestMessage: message });
    resJson(res, 201, "Success send message.", message);
  } catch (error) {
    next(error);
  }
}
