import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import Redis from "../../config/redisClient.js";

export default async function addUsersToGroup(req, res, next) {
  try {
    const user = req.user;
    const { groupId, userIds } = req.body;

    const dbChat = await ChatDB.findById(groupId);
    if (!dbChat) throw resError(404, "Chat not found!");

    // Parse and validate userIds
    const arrayUserIds = Array.isArray(userIds) ? userIds : JSON.parse(userIds);

    // Check if all userIds exist in DB
    const count = await UserDB.countDocuments({ _id: { $in: arrayUserIds } });
    if (count !== arrayUserIds.length)
      throw resError(404, "One or more users not found!");

    const alreadyUsers = arrayUserIds.filter((id) =>
      dbChat.users.some((u) => u.user?.toString() === id)
    );

    if (alreadyUsers.length) {
      throw resError(
        409,
        `User with id ${arrayUserIds.join(", ")} already member!`
      );
    }

    const newUsers = arrayUserIds.map((id) => ({
      user: id,
      joinedAt: new Date(),
    }));

    const updatedChat = await ChatDB.findByIdAndUpdate(
      groupId,
      { $addToSet: { users: { $each: newUsers } } },
      { new: true }
    )
      .populate({
        path: "users.user deletedInfos.user initiator unreadInfos.user",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      })
      .lean();

    // Real-time: Emit to other chat members
    // const io = req.app.get('io');
    // await Promise.all(
    //   updatedChat.users.map(async (entry) => {
    //     const userId = entry.user?._id?.toString?.() || entry.user.toString();
    //     if (userId === user._id.toString()) return;
    //     const socketId = await Redis.hGet("onlineUsers", userId);
    //     if (socketId) {
    //       io.to(socketId).emit("new-chat", { chat: updatedChat });
    //     }
    //   })
    // );

    return resJson(res, 200, "Success add user to group chat.", updatedChat);
  } catch (error) {
    next(error);
  }
}
