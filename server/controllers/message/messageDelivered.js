import MessageDB from "../../models/message.js";
import resJson from "../../utils/resJson.js";

export default async function messageDelivered(req, res, next) {
  try {
    const user = req.user;
    const chatId = req.body.chatId;

    // Update messages: not sent by this user, in this chat, and not yet delivered or beyond
    await MessageDB.updateMany(
      {
        chat: chatId,
        sender: { $ne: user._id },
        status: { $in: "sent" },
      },
      { $set: { status: "delivered" } }
    );

    const messages = await MessageDB.find({
      chat: chatId,
      sender: { $ne: user._id },
      status: "delivered",
    })
      .sort({ createdAt: 1 })
      .populate([
        {
          path: "sender",
          select: "-password",
        },
        {
          path: "chat",
          populate: [
            {
              path: "users.user deletedInfos.user initiator unreadInfos.user latestMessage",
              select: "-password",
            },
          ],
        },
      ]);

    return resJson(res, 200, "Messages marked as delivered.", messages);
  } catch (error) {
    next(error);
  }
}
