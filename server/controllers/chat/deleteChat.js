import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function deleteChat(req, res, next) {
  try {
    const userId = req.userId;
    const chatId = req.body.chatId;

    const [user, chat] = await Promise.all([
      UserDB.findById(userId),
      ChatDB.findById(chatId),
    ]);

    if (!user) throw resError(401, "Authenticated user not found!");
    if (!chat) throw resError(404, "Chat not found!");

    // Check user in group or not
    const isUserInChat = chat.users.some((entry) =>
      entry.user.equals(user._id)
    );
    if (!isUserInChat)
      throw resError(400, "You are not a member of this chat!");

    // Remove old deletedInfos for this user, then add the new one
    await ChatDB.findByIdAndUpdate(chatId, {
      $pull: { deletedInfos: { user: userId } },
    });
    await ChatDB.findByIdAndUpdate(
      chatId,
      {
        $addToSet: {
          deletedInfos: {
            user: userId,
            deletedAt: new Date(),
          },
        },
        $unset: { latestMessage: "" },
        $set: {
          "unreadInfos.$[elem].count": 0,
        },
      },
      {
        arrayFilters: [{ "elem.user": userId }],
      }
    );

    return resJson(res, 200, "Success deleted chat.");
  } catch (error) {
    next(error);
  }
}
