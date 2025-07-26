import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import {Redis} from "../../config/redisClient.js";

export default async function removeUserFromGroup(req, res, next) {
  try {
    const user = req.user;
    const { groupId, userId: targetUserId } = req.body;

    const dbChat = await ChatDB.findById(groupId);
    if (!dbChat) throw resError(404, "Group chat not found!");

    const targetMember = dbChat.users.find(
      (u) => u.user?.toString() === targetUserId
    );

    if (!targetMember)
      throw resError(404, "Target user is not a member of this group chat!");

    const authMember = dbChat.users.find(
      (u) => u.user?.toString() === user._id.toString()
    );

    if (!authMember)
      throw resError(403, "You are not a member of this group chat.");

    if (!["admin", "leader"].includes(authMember.role))
      throw resError(403, "Only group leader and admin can remove member!");

    if (["admin", "leader"].includes(targetMember.role))
      throw resError(
        400,
        "Cannot remove a group admin or leader. Demote them first!"
      );
    await ChatDB.findByIdAndUpdate(groupId, {
      $pull: {
        deletedInfos: { user: targetUserId },
        users: { user: targetUserId },
      },
    });
    const updatedGroup = await ChatDB.findByIdAndUpdate(
      groupId,
      {
        $push: {
          deletedInfos: {
            user: targetUserId,
            deletedAt: new Date(),
          },
        },
        $set: {
          "unreadInfos.$[elem].count": 0,
        },
      },
      {
        arrayFilters: [{ "elem.user": targetUserId }],
        new: true,
      }
    )
      .populate({
        path: "users.user deletedInfos.user unreadInfos.user initiator",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      });

    console.log(updatedGroup);

    // Real-time: Emit to other chat members
    const io = req.app.get("io");
    const socketId = await Redis.hGet("onlineUsers", targetUserId);
    if (socketId) io.to(socketId).emit("remove-chat", { chat: updatedGroup });

    return resJson(
      res,
      200,
      "Successfully removed member from group chat.",
      updatedGroup
    );
  } catch (error) {
    next(error);
  }
}
