import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function removeUserFromGroup(req, res, next) {
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

    const isAdmin = dbChat.groupAdmins.some(
      (a) => a.user?.toString() === user._id.toString()
    );

    if (!isAdmin)
      throw resError(403, "Only group leader and admin can remove member!");

    const isTargetAdmin = dbChat.groupAdmins.some(
      (a) => a.user?.toString() === targetUserId
    );

    if (isTargetAdmin)
      throw resError(
        400,
        "Cannot remove a group admin. Remove admin role first!"
      );

    const updatedGroup = await ChatDB.findByIdAndUpdate(
      groupId,
      { $pull: { users: { user: targetUserId } } },
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
      "Success removed member from group chat.",
      updatedGroup
    );
  } catch (error) {
    next(error);
  }
}
