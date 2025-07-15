import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function removeAdminFromGroup(req, res, next) {
  try {
    const { _id: authUserId } = req.user;
    const { groupId, userId: targetUserId } = req.body;

    const dbChat = await ChatDB.findById(groupId);
    if (!dbChat) throw resError(404, "Group chat not found!");

    const targetUser = dbChat.users.find((u) => u.user.equals(targetUserId));
    if (!targetUser)
      throw resError(404, "Target user is not a member of this group chat!");

    const authUser = dbChat.users.find((u) => u.user.equals(authUserId));
    if (!authUser)
      throw resError(403, "You are not a member of this group chat.");

    if (authUser.role !== "leader") {
      throw resError(403, "Only group leader can remove an admin.");
    }

    if (targetUser.role !== "admin") {
      throw resError(400, "Target user is not a group admin.");
    }

    // Update role to 'member'
    await ChatDB.updateOne(
      { _id: groupId, "users.user": targetUserId },
      { $set: { "users.$.role": "member" } }
    );

    const updatedGroup = await ChatDB.findById(groupId)
      .populate({
        path: "users.user deletedInfos.user unreadInfos.user initiator",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "-password" },
      })
      .lean();

    return resJson(
      res,
      200,
      "Successfully removed admin from group chat.",
      updatedGroup
    );
  } catch (error) {
    next(error);
  }
}
