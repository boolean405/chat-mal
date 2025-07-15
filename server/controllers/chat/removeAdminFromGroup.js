import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function removeAdminFromGroup(req, res, next) {
  try {
    const user = req.user;
    const { groupId, userId: targetUserId } = req.body;

    const dbChat = await ChatDB.findById(groupId);
    if (!dbChat) throw resError(404, "Group chat not found!");

    const isTargetMember = dbChat.users.some(
      (u) => u.user?.toString() === targetUserId
    );

    if (!isTargetMember)
      throw resError(404, "Target user is not a member of this group chat!");

    const isAuthMember = dbChat.users.some(
      (u) => u.user?.toString() === user._id.toString()
    );

    if (!isAuthMember)
      throw resError(403, "You are not a member of this group chat.");

    const isLeader = dbChat.initiator.toString() === user._id.toString();

    if (!isLeader) throw resError(403, "Only leader can remove admin!");

    const isTargetAdmin = dbChat.groupAdmins.some(
      (a) => a.user?.toString() === targetUserId
    );

    if (!isTargetAdmin)
      throw resError(400, "Target user is not a group admin!");

    const updatedGroup = await ChatDB.findByIdAndUpdate(
      groupId,
      { $pull: { groupAdmins: { user: targetUserId } } },
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
      });
    return resJson(
      res,
      200,
      "Success removed admin from group chat.",
      updatedGroup
    );
  } catch (error) {
    next(error);
  }
}
