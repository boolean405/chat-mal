import MessageDB from "../../models/message.js";

export async function updateAndEmitMessages({
  chat,
  userId,
  unreadInfo,
  socket,
  io,
}) {
  if (!unreadInfo?.count) return [];

  const deletedInfo = chat.deletedInfos?.find(
    (info) => info.user.toString() === userId
  );
  const deletedAt = deletedInfo?.deletedAt || null;

  const messages = await MessageDB.find({
    chat: chat._id,
    ...(deletedAt && { createdAt: { $gt: deletedAt } }),
    status: "sent",
    sender: { $ne: userId },
  })
    .sort({ createdAt: -1 })
    .limit(unreadInfo.count)
    .populate("sender", "-password")
    .populate({
      path: "chat",
      populate: [
        {
          path: "users.user unreadInfos.user deletedInfos.user initiator",
          select: "-password",
        },
        { path: "latestMessage" },
      ],
    });

  return messages.reverse();
}
