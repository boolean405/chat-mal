import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function deleteChat(req, res, next) {
  try {
    const userId = req.userId;
    const chatId = req.body.chatId;

    const [userExists, dbChat] = await Promise.all([
      UserDB.exists({ _id: userId }),
      ChatDB.findById(chatId),
    ]);

    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!dbChat) throw resError(404, "Chat not found!");

    // Check user in group or not
    const isUserInChat = dbChat.users.some(
      (entry) => entry.user.toString() === userId.toString()
    );
    if (!isUserInChat) throw resError(400, "You are not a user of this chat!");

    // Remove old deletedInfos for this user, then add the new one
    await ChatDB.findByIdAndUpdate(chatId, {
      $pull: { deletedInfos: { user: userId } },
    });
    await ChatDB.findByIdAndUpdate(chatId, {
      $addToSet: {
        deletedInfos: {
          user: userId,
          deletedAt: new Date(),
        },
      },
    });

    resJson(res, 200, "Success deleted chat.");
  } catch (error) {
    next(error);
  }
}
