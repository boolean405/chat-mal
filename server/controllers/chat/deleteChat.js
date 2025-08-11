import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function deleteChat(req, res, next) {
  try {
    const user = req.user;
    const chatId = req.body.chatId;

    const chat = await ChatDB.findById(chatId);
    if (!chat) {throw resError(404, "Chat not found!");}

    // Check user in group or not
    const isUserInChat = chat.users.some((entry) =>
      entry.user.equals(user._id)
    );
    if (!isUserInChat)
      {throw resError(400, "You are not a member of this chat!");}

    // Remove old deletedInfos for this user, then add the new one
    await ChatDB.findByIdAndUpdate(chatId, {
      $pull: { deletedInfos: { user: user._id } },
    });
    await ChatDB.findByIdAndUpdate(
      chatId,
      {
        $addToSet: {
          deletedInfos: {
            user: user._id,
            deletedAt: new Date(),
          },
        },

        $set: {
          "unreadInfos.$[elem].count": 0,
        },
      },
      {
        arrayFilters: [{ "elem.user": user._id }],
      }
    );

    return resJson(res, 200, "Success deleted chat.");
  } catch (error) {
    next(error);
  }
}
