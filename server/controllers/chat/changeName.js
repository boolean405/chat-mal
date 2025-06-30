import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function changeName(req, res, next) {
  try {
    const userId = req.userId;
    const { name, chatId } = req.body;

    const [userExists, chat] = await Promise.all([
      UserDB.exists({ _id: userId }),
      ChatDB.findById(chatId),
    ]);

    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!chat) throw resError(404, "Chat not found!");

    // Authorization check
    if (chat.isGroupChat) {
      const isAdmin = chat.groupAdmins.some(
        (admin) => admin.user.toString() === userId.toString()
      );
      if (!isAdmin)
        throw resError(403, "Only group admins can change group name!");
    } else {
      const isParticipant = chat.users.some(
        (u) => u.user.toString() === userId.toString()
      );
      if (!isParticipant)
        throw resError(403, "Only chat participants can change chat name!");
    }

    const updatedChat = await ChatDB.findByIdAndUpdate(
      chatId,
      { name },
      { new: true }
    ).populate({
      path: "users.user groupAdmins.user",
      select: "-password",
    });

    resJson(res, 200, "Success change name of chat.", updatedChat);
  } catch (error) {
    next(error);
  }
}
